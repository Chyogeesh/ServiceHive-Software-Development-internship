import React, { useState } from 'react';
import { Event } from '../types';
import { apiService } from '../services/api';
import { format, parseISO } from 'date-fns';

interface EventListProps {
  events: Event[];
  onRefresh?: () => void;
  onEventUpdated?: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ events, onRefresh, onEventUpdated }) => {
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleMakeSwappable = async (eventId: string, currentStatus: Event['status']) => {
    if (currentStatus === 'SWAP_PENDING') {
      setError('This event is currently pending a swap request.');
      return;
    }

    setUpdatingEventId(eventId);
    setError('');

    try {
      const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
      const updatedEvent = await apiService.updateEventStatus(eventId, newStatus);
      onEventUpdated?.(updatedEvent);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update event status');
    } finally {
      setUpdatingEventId(null);
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${format(parseISO(start), 'EEE, MMM d, h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  };

  if (!events.length) {
    return (
      <div className="empty-state">
        <h3>No events yet</h3>
        <p>Create your first event to get started!</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      <div className="list-header">
        <h2>My Events</h2>
        {onRefresh && (
          <button onClick={onRefresh} className="refresh-btn">
            Refresh
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className={`event-card ${event.status.toLowerCase()}`}>
            <div className="event-header">
              <h3>{event.title}</h3>
              <span className={`status-badge status-${event.status.toLowerCase()}`}>
                {event.status}
              </span>
            </div>
            
            <div className="event-time">
              {formatTimeRange(event.startTime, event.endTime)}
            </div>
            
            <div className="event-actions">
              {event.status === 'BUSY' || event.status === 'SWAPPABLE' ? (
                <button
                  onClick={() => handleMakeSwappable(event.id, event.status)}
                  disabled={updatingEventId === event.id}
                  className={`action-btn btn-${event.status === 'BUSY' ? 'swappable' : 'busy'}`}
                >
                  {updatingEventId === event.id ? 'Updating...' : 
                   event.status === 'BUSY' ? 'Make Swappable' : 'Make Busy'}
                </button>
              ) : (
                <span className="status-info">Pending swap...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
