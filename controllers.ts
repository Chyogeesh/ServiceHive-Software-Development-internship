import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Event, EventStatus } from '../models/Event';
import { AuthRequest } from '../middleware/auth';

export const getMyEvents = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    const events = await eventRepository.find({
      where: { userId: req.user!.id },
      order: { startTime: 'ASC' }
    });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    const { title, startTime, endTime } = req.body;

    const event = new Event();
    event.title = title;
    event.startTime = new Date(startTime);
    event.endTime = new Date(endTime);
    event.status = EventStatus.BUSY;
    event.userId = req.user!.id;

    const savedEvent = await eventRepository.save(event);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEventStatus = async (req: AuthRequest, res: Response) => {
  try {
    const eventRepository = getRepository(Event);
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await eventRepository.findOne({ 
      where: { id: eventId, userId: req.user!.id } 
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Only allow changing from BUSY to SWAPPABLE or back
    if (event.status === EventStatus.BUSY && status === EventStatus.SWAPPABLE) {
      event.status = EventStatus.SWAPPABLE;
    } else if (event.status === EventStatus.SWAPPABLE && status === EventStatus.BUSY) {
      event.status = EventStatus.BUSY;
    } else {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    const updatedEvent = await eventRepository.save(event);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};
