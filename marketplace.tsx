import React, { useState, useEffect } from 'react';
import EventList from '../components/EventList';
import SwappableSlotCard from '../components/SwappableSlotCard';
import { Event, SwappableSlot } from '../types';
import { apiService } from '../services/api';

const Marketplace: React.FC = () => {
  const [swappableSlots, setSwappableSlots] = useState<SwappableSlot[]>([]);
  const [mySwappableEvents, setMySwappableEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [slotsResponse, eventsResponse] = await Promise.all([
        apiService.getSwappableSlots(),
        apiService.getMyEvents()
      ]);

      setSwappableSlots(slotsResponse);
      setMySwappableEvents(eventsResponse.filter(event => event.status === 'SWAPPABLE'));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwapRequested = () => {
    fetchData(); // Refresh data after successful swap request
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>Swappable Slots Marketplace</h1>
        <p>Browse available time slots from other users</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="marketplace-content">
        {mySwappableEvents.length === 0 && (
          <div className="no-swappable-warning">
            <h3>Make Some Slots Swappable!</h3>
            <p>To request a swap, you need to mark some of your events as swappable first.</p>
            <a href="/dashboard" className="dashboard-link">Go to Dashboard</a>
          </div>
        )}

        {swappableSlots.length === 0 ? (
          <div className="empty-state">
            <h3>No swappable slots available</h3>
            <p>Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="slots-grid">
            {swappableSlots.map((slot) => (
              <SwappableSlotCard
                key={slot.id}
                slot={slot}
                mySwappableEvents={mySwappableEvents}
                onSwapRequested={handleSwapRequested}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
