import React, { useState } from 'react';
import { SwappableSlot } from '../types';
import { apiService } from '../services/api';
import { format, parseISO } from 'date-fns';

interface SwapModalProps {
  targetSlot: SwappableSlot;
  mySwappableEvents: SwappableSlot[];
  onClose: () => void;
  onSwapRequested: () => void;
}

const SwapModal: React.FC<SwapModalProps> = ({ 
  targetSlot, 
  mySwappableEvents, 
  onClose, 
  onSwapRequested 
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwapRequest = async () => {
    if (!selectedSlotId) {
      setError('Please select a slot to offer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.createSwapRequest({
        mySlotId: selectedSlotId,
        theirSlotId: targetSlot.id
      });
      
      onSwapRequested();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create swap request');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${format(parseISO(start), 'h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Swap</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="swap-preview">
            <div className="slot-section">
              <h3>They'll Get:</h3>
              <div className="slot-info">
                <div className="slot-title">{targetSlot.title}</div>
                <div className="slot-time">{formatTimeRange(targetSlot.startTime, targetSlot.endTime)}</div>
                <div className="slot-owner">from {targetSlot.ownerName}</div>
              </div>
            </div>
            
            <div className="swap-arrow">↔</div>
            
            <div className="slot-section">
              <h3>You'll Get:</h3>
              <div className="slot-info">
                <div className="slot-title">Your Slot</div>
                <div className="slot-time">{formatTimeRange(targetSlot.startTime, targetSlot.endTime)}</div>
              </div>
            </div>
          </div>

          <div className="offer-section">
            <h3>Select Your Offer:</h3>
            {mySwappableEvents.length === 0 ? (
              <p className="no-slots">You need to mark some events as swappable first!</p>
            ) : (
              <div className="offer-options">
                {mySwappableEvents.map((event) => (
                  <label key={event.id} className="offer-option">
                    <input
                      type="radio"
                      value={event.id}
                      checked={selectedSlotId === event.id}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                    />
                    <div className="offer-details">
                      <div className="offer-title">{event.title}</div>
                      <div className="offer-time">{formatTimeRange(event.startTime, event.endTime)}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSwapRequest} 
            disabled={!selectedSlotId || loading}
            className="confirm-btn"
          >
            {loading ? 'Requesting...' : 'Request Swap'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;
