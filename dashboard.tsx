import React, { useState, useEffect } from 'react';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import { Event } from '../types';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiService.getMyEvents();
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    setShowForm(false);
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvents(prev => 
      prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    );
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading your events...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Calendar</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="toggle-form-btn"
          >
            {showForm ? 'Cancel' : 'Add Event'}
          </button>
          <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-section">
          <EventForm onEventCreated={handleEventCreated} />
        </div>
      )}

      <EventList 
        events={events} 
        onRefresh={handleRefresh}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
};

export default Dashboard;
