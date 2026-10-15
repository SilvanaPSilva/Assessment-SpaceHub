import { Request, Response } from 'express';
import { BookingService } from '../services/bookings';

const bookingService = new BookingService();

//Reuseble helper
const getBookingById = (req: Request): string => {
  return Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
};

export class BookingController {
  //CREATE A BOOKING  
  /**
   * @openapi
   * /bookings:
   *   post:
   *     summary: Create a new Booking
   *     tags:
   *       - Bookings
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateBookingInput'
   *     responses:
   *       201:
   *         description: Booking Successfully created
   *       400:
   *         description: Invalid booking data or dates
   *       404:
   *         description: Hub not found
   *       500:
   *         description: Internal server error
   */
  createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const newBooking = await bookingService.createBooking(req.body);
      res.status(201).json(newBooking);
    } catch (error) {
      if (error instanceof Error) {

        const validationMessages = [
          'Invalid booking dates', 'Bookings must be made at least one day in advance.', 'Check-out must be after check-in.'
        ];
        if (validationMessages.includes(error.message)) {
          res.status(400).json({ message: error.message });
          return;
        }

        if (error.message === 'Hub not found') {
          res.status(404).json({ message: error.message });
          return;
        }
      }

      res.status(500).json({ message: 'Error inserting into MongoDB', error });
    }
  };
  //READ ALL BOOKINGS
  /**
  * @openapi
  * /bookings:
  *   get:
  *     summary: Retrieve all Bookings
  *     tags:
  *       - Bookings
  *     responses:
  *       200:
  *         description: Successfully retrieved Bookings
  *       500:
  *         description: Internal server error
  */
  getBookings = async (_req: Request, res: Response): Promise<void> => {
    try {
      const bookings = await bookingService.getAllBooking();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings', error });
    }
  };

  //READ BOOKINGS BY ID
  /** 
 * @openapi
 * /bookings/{id}:
 *   get:
 *     summary: Get a Booking by Id
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string     
 *     responses:
 *       200:
 *         description: Booking found 
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
  getBookingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = getBookingById(req);
      //Reusable helper
      //const getBookingById = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      //Reusable helper [getBookingById(req)]so we do not repeat the same code.
      const booking_By_Id = await bookingService.getBookingById(bookingId);
      if (!booking_By_Id) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }
      res.status(200).json(booking_By_Id);

    } catch (error) {
      res.status(500).json({ message: 'Error fetching booking', error });
    }
  };
  //UPDATE
  /** 
 * @openapi
 * /bookings/{id}:
 *   put:
 *     summary: Update an existing booking
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookingInput'
 *     responses:
 *       200:
 *         description: Successfully updated booking
 *       400:
 *         description: Missing or incorrect booking information
 *       404:
 *         description: Booking or hub not found
 *       500:
 *         description: Internal server error
 */
  updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = getBookingById(req); //Reusable helper - Line 91
      const updatedBooking = await bookingService.updateBookings(bookingId, req.body);     
      
      if (!updatedBooking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }

      res.status(200).json(updatedBooking);
      
    } catch (error) {
      if (error instanceof Error) {

        const validationMessages = [
          'Invalid booking dates', 'Bookings must be made at least one day in advance.', 'Check-out must be after check-in.'
        ];
        if (validationMessages.includes(error.message)) {
          res.status(400).json({ message: error.message });
          return;
        }

        if (error.message === 'Hub not found') {
          res.status(404).json({ message: error.message });
          return;
        }
      }

      res.status(500).json({ message: 'Error updating booking', error });
    }
  };

  //DELETE
  /**
  * @openapi
  * /bookings/{id}:
  *   delete:
  *     summary: Delete a Booking by ID
  *     tags:
  *       - Bookings
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: string
  *     responses:
  *       200:
  *         description: Booking deleted successfully
  *       404:
  *         description: Booking not found
  *       500:
  *         description: Internal server error
  */
  deleteBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const bookingId = getBookingById(req); //Reusable helper - Line 91
      const deletedBooking = await bookingService.deleteBooking(bookingId);
      if (!deletedBooking) {
        res.status(404).json({ message: 'Booking not found' });
        return;
      }
      res.status(200).json({
        message: 'Booking deleted successfully',
        data: deletedBooking
      });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting booking', error });
    }
  };
} 