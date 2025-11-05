import React, { useState, useEffect } from 'react';
import { SwapRequest } from '../types';
import { apiService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<{ outgoing: SwapRequest[]; incoming: SwapRequest[] }>({
    outgoing: [],
    incoming: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMySwapRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = async (requestId: string, accepted: boolean) => {
    try {
      await apiService.respondToSwapRequest(requestId, accepted);
      fetchRequests(); // Refresh after response
    } catch (err: any) {
      setError(`Failed to ${accepted ? 'accept' : 'reject'} request`);
    }
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="requests">
      <div className="requests-header">
        <h1>Swap Requests</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="requests-content">
        {/* Incoming Requests */}
        <div className="requests-section">
          <h2>Incoming Requests ({requests.incoming.length})</h2>
          {requests.incoming.length === 0 ? (
            <div className="empty-state">
              <p>No incoming swap requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.incoming.map((request) => (
                <div key={request.id} className="request-card incoming">
                  <div className="request-details">
                    <div className="request-offer">
                      <span className="label">They want:</span>
                      <span className="value">{request.offerTitle}</span>
                      {request.offerOwner && (
                        <span className="owner">from {request.offerOwner}</span>
                      )}
                    </div>
                    <div className="request-exchange">
                      <span className="exchange">↔</span>
                      <span>Your slot</span>
                    </div>
                  </div>
                  
                  <div className="request-meta">
                    <span className="time">{formatTimeAgo(request.createdAt)}</span>
                    <div className="request-actions">
                      <button
                        onClick={() => handleRespond(request.id, true)}
                        className="accept-btn"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(request.id, false)}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="requests-section">
          <h2>Outgoing Requests ({requests.outgoing.length})</h2>
          {requests.outgoing.length === 0 ? (
            <div className="empty-state">
              <p>No outgoing swap requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {requests.outgoing.map((request) => (
                <div key={request.id} className="request-card outgoing">
                  <div className="request-details">
                    <div className="request-offer">
                      <span className="label">You offered:</span>
                      <span className="value">Your slot</span>
                    </div>
                    <div className="request-exchange">
                      <span className="exchange">↔</span>
                      <span className="value">{request.requestTitle}</span>
                      {request.requestOwner && (
                        <span className="owner">from {request.requestOwner}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="request-meta">
                    <span className="status pending">Pending</span>
                    <span className="time">{formatTimeAgo(request.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
