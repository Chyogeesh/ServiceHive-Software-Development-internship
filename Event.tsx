import React, { useState } from 'react';
import { Event } from '../types';
import { apiService } from '../services/api';

interface EventFormProps {
  onEventCreated?: (event: Event) => void;
  initialData?: Partial<Event>;
}

const EventForm: React.FC<EventFormProps> = ({ onEventCreated, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventData = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const newEvent = await apiService.createEvent(eventData);
      onEventCreated?.(newEvent);
      
      // Reset form
      setFormData({ title: '', startTime: '', endTime: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="event-form">
      <div className="form-group">
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="startTime">Start Time</label>
        <input
          type="datetime-local"
          id="startTime"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          required
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="endTime">End Time</label>
        <input
          type="datetime-local"
          id="endTime"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          required
          min={formData.startTime}
          className="form-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};

export default EventForm;
