import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMyEvents, createEvent, updateEventStatus } from '../controllers/eventController';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyEvents);
router.post('/', createEvent);
router.patch('/:eventId/status', updateEventStatus);

export default router;
