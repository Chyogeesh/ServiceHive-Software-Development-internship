import React from 'react';
import { SwappableSlot } from '../types';
import { format, parseISO } from 'date-fns';
import SwapModal from './SwapModal';

interface SwappableSlotCardProps {
  slot: SwappableSlot;
  mySwappableEvents: SwappableSlot[];
  onSwapRequested: () => void;
}

const SwappableSlotCard: React.FC<SwappableSlotCardProps> = ({ 
  slot, 
  mySwappableEvents, 
  onSwapRequested 
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const formatTimeRange = (start: string, end: string) => {
    return `${format(parseISO(start), 'EEE, MMM d, h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  };

  return (
    <>
      <div className="swappable-slot-card">
        <div className="slot-header">
          <h3>{slot.title}</h3>
          <span className="owner">by {slot.ownerName}</span>
        </div>
        
        <div className="slot-time">
          {formatTimeRange(slot.startTime, slot.endTime)}
        </div>
        
        <div className="slot-actions">
          <button 
            onClick={() => setShowModal(true)} 
            className="request-swap-btn"
            disabled={mySwappableEvents.length === 0}
          >
            {mySwappableEvents.length === 0 
              ? 'Make a slot swappable first' 
              : 'Request Swap'
            }
          </button>
        </div>
      </div>
      
      {showModal && (
        <SwapModal
          targetSlot={slot}
          mySwappableEvents={mySwappableEvents}
          onClose={() => setShowModal(false)}
          onSwapRequested={onSwapRequested}
        />
      )}
    </>
  );
};

export default SwappableSlotCard;
