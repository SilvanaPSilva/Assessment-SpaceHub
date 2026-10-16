import { Router } from 'express'; 
import { authenticateKey } from '../middleware/auth.middleware'; // Import the authentication middleware
import { logRequest } from '../middleware/logging.middleware'; // Import the logging middleware
import { validate } from '../middleware/validate.middleware';
import { BookingController } from '../controllers/bookings';
import { createBookingsZSchema } from '../models/bookings';
import { updateBookingsZSchema } from '../models/bookings';

const router = Router();
const bookingsController = new BookingController(); 

router.post('/', authenticateKey, logRequest, validate(createBookingsZSchema), bookingsController.createBooking);
router.get('/', bookingsController.getBookings);
router.get('/:id', bookingsController.getBookingById); 
router.put('/:id', authenticateKey, logRequest, validate(updateBookingsZSchema), bookingsController.updateBooking);
router.delete('/:id', bookingsController.deleteBooking); 

export default router; 


