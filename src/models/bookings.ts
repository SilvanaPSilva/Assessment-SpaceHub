import { Schema, model } from 'mongoose';
import { z } from 'zod';


//Interface for Booking
export interface IBooking {
  hubId: string;
  checking: Date;
  checkout: Date;
  totalDays?: number;
  invoice?: number;
}

//Schema Mongoose
const bookingSchema = new Schema<IBooking>(
  {
    hubId: { type: String, required: true, ref: 'Hub'},
    checking: { type: Date, required: true },
    checkout: { type: Date, required: true },
    totalDays: {type: Number, required: true, min: 1 },
    invoice: { type: Number, required: false},
  },
  { timestamps: true }
);

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateBookingInput:
 *       type: object
 *       required:
 *         - hubId
 *         - checking
 *         - checkout
 *       properties:
 *         hubId:
 *            type: string
 *            description: ID of the hub being booked
 *         checking:
 *            type: string
 *            format: date
 *            example: "2026-11-01"
 *         checkout:
 *            type: string
 *            format: date
 *            example: "2026-11-03"         
 */
export const createBookingsZSchema = z.object({
  hubId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hub ID'),
  checking: z.iso.date(),
  checkout: z.iso.date(),
});

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateBookingInput:
 *        type: object
 *        properties:
 *          hubId:
 *            type: string
 *            description: ID of the hub being booked
 *          checking:
 *            type: string
 *            format: date
 *            example: "2026-11-01"
 *          checkout:
 *            type: string
 *            format: date
 *            example: "2026-11-03"   
 */
export const updateBookingsZSchema = z.object({
  hubId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid hub ID').optional(), //chatGPT
  checking: z.iso.date().optional(),
  checkout: z.iso.date().optional(),
});

export const BookingModel = model<IBooking>('Booking', bookingSchema);
