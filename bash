docker-compose up --build
cd backend
cp .env.example .env
npm install
npm run dev
cd frontend
npm install
npm start
curl -X POST http://localhost:3001/api/swaps/swap-request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mySlotId": "event-uuid-1",
    "theirSlotId": "event-uuid-2"
  }'
Method,Endpoint,Description,Auth Required
POST,/api/auth/signup,Create new user account,No
POST,/api/auth/login,User login,No
GET,/api/events,Get user's events,Yes
POST,/api/events,Create new event,Yes
PATCH,/api/events/:eventId/status,Update event status,Yes
GET,/api/swaps/swappable-slots,Get available swappable slots,Yes
POST,/api/swaps/swap-request,Create swap request,Yes
POST,/api/swaps/swap-response/:requestId,Respond to swap request,Yes
GET,/api/swaps/my-requests,Get user's swap requests,Yes
