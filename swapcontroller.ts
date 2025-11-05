import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Event, EventStatus } from '../models/Event';
import { SwapRequest, SwapStatus } from '../models/SwapRequest';
import { AuthRequest } from '../middleware/auth';

export const getSwappableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    
    const swappableSlots = await eventRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.SWAPPABLE })
      .andWhere('event.userId != :userId', { userId: req.user!.id })
      .leftJoinAndSelect('event.user', 'user')
      .orderBy('event.startTime', 'ASC')
      .getMany();

    // Format for frontend
    const formattedSlots = swappableSlots.map(slot => ({
      id: slot.id,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      ownerName: slot.user.name,
      ownerId: slot.user.id
    }));

    res.json(formattedSlots);
  } catch (error) {
    console.error('Get swappable slots error:', error);
    res.status(500).json({ error: 'Failed to fetch swappable slots' });
  }
};

export const createSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    const swapRequestRepository = getRepository(SwapRequest);

    const { mySlotId, theirSlotId } = req.body;

    // Verify both slots exist and are SWAPPABLE
    const mySlot = await eventRepository.findOne({ 
      where: { id: mySlotId, userId: req.user!.id, status: EventStatus.SWAPPABLE } 
    });

    const theirSlot = await eventRepository.findOne({ 
      where: { id: theirSlotId, status: EventStatus.SWAPPABLE } 
    });

    if (!mySlot || !theirSlot) {
      return res.status(400).json({ error: 'Invalid slots for swap' });
    }

    // Check if slots already have pending requests
    const existingRequest = await swapRequestRepository.findOne({
      where: [
        { offerSlotId: mySlotId, status: SwapStatus.PENDING },
        { requestSlotId: mySlotId, status: SwapStatus.PENDING },
        { offerSlotId: theirSlotId, status: SwapStatus.PENDING },
        { requestSlotId: theirSlotId, status: SwapStatus.PENDING }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'One of the slots is already pending a swap' });
    }

    // Create swap request
    const swapRequest = new SwapRequest();
    swapRequest.offerSlotId = mySlotId;
    swapRequest.requestSlotId = theirSlotId;
    swapRequest.requesterId = req.user!.id;
    swapRequest.recipientId = theirSlot.userId;

    // Mark both slots as SWAP_PENDING
    mySlot.status = EventStatus.SWAP_PENDING;
    theirSlot.status = EventStatus.SWAP_PENDING;

    await eventRepository.save([mySlot, theirSlot]);
    const savedRequest = await swapRequestRepository.save(swapRequest);

    res.status(201).json({
      message: 'Swap request created successfully',
      request: savedRequest
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
};

export const respondToSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    const swapRequestRepository = getRepository(SwapRequest);
    const { requestId } = req.params;
    const { accepted } = req.body;

    const swapRequest = await swapRequestRepository.findOne({
      where: { id: requestId, recipientId: req.user!.id, status: SwapStatus.PENDING },
      relations: ['offerSlot', 'requestSlot']
    });

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    if (accepted) {
      // Swap the events - exchange user ownership
      const offerSlot = swapRequest.offerSlot;
      const requestSlot = swapRequest.requestSlot;

      // Transaction-like behavior
      const originalOfferUserId = offerSlot.userId;
      offerSlot.userId = requestSlot.userId;
      requestSlot.userId = originalOfferUserId;

      // Update status back to BUSY
      offerSlot.status = EventStatus.BUSY;
      requestSlot.status = EventStatus.BUSY;

      swapRequest.status = SwapStatus.ACCEPTED;

      await eventRepository.save([offerSlot, requestSlot]);
      await swapRequestRepository.save(swapRequest);

      res.json({
        message: 'Swap accepted successfully',
        swapRequest
      });
    } else {
      // Reject - restore slots to SWAPPABLE
      swapRequest.status = SwapStatus.REJECTED;
      
      const offerSlot = await eventRepository.findOne(swapRequest.offerSlotId);
      const requestSlot = await eventRepository.findOne(swapRequest.requestSlotId);

      if (offerSlot) offerSlot.status = EventStatus.SWAPPABLE;
      if (requestSlot) requestSlot.status = EventStatus.SWAPPABLE;

      await eventRepository.save([offerSlot!, requestSlot!]);
      await swapRequestRepository.save(swapRequest);

      res.json({
        message: 'Swap rejected',
        swapRequest
      });
    }
  } catch (error) {
    console.error('Respond to swap error:', error);
    res.status(500).json({ error: 'Failed to process swap response' });
  }
};

export const getMySwapRequests = async (req: AuthRequest, res: Response) => {
  try {
    const swapRequestRepository = getRepository(SwapRequest);
    const eventRepository = getRepository(Event);

    // Get outgoing requests (where user is requester)
    const outgoingRequests = await swapRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requestSlot', 'requestSlot')
      .leftJoinAndSelect('requestSlot.user', 'requestSlotUser')
      .where('request.requesterId = :userId', { userId: req.user!.id })
      .andWhere('request.status = :status', { status: SwapStatus.PENDING })
      .getMany();

    // Get incoming requests (where user is recipient)
    const incomingRequests = await swapRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.offerSlot', 'offerSlot')
      .leftJoinAndSelect('offerSlot.user', 'offerSlotUser')
      .where('request.recipientId = :userId', { userId: req.user!.id })
      .andWhere('request.status = :status', { status: SwapStatus.PENDING })
      .getMany();

    // Format responses
    const formattedOutgoing = outgoingRequests.map(req => ({
      id: req.id,
      status: req.status,
      offerTitle: 'My Slot', // User's own slot
      requestTitle: req.requestSlot.title,
      requestOwner: req.requestSlot.user.name,
      createdAt: req.createdAt
    }));

    const formattedIncoming = incomingRequests.map(req => ({
      id: req.id,
      status: req.status,
      offerTitle: req.offerSlot.title,
      offerOwner: req.offerSlot.user.name,
      requestTitle: 'My Slot', // User's own slot
      createdAt: req.createdAt
    }));

    res.json({
      outgoing: formattedOutgoing,
      incoming: formattedIncoming
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};
