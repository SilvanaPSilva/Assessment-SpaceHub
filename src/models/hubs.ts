import { Schema, model } from 'mongoose';
import { z } from 'zod';

//Interface for Hub
export interface IHub {
    roomNumber: number;
    capacity: '1-2' | '3-5' | '6-10';
    equipment?: ('Cable' | 'TV' | 'Projector')[];
    price?: number;
}

//Schema Mongoose
const hubSchema = new Schema<IHub>(
    {
        roomNumber: { type: Number, required: true, min: 1, max: 4 },
        capacity: { type: String, required: true, enum: ['1-2', '3-5', '6-10', '10'] },
        equipment: { type: [String], enum: ['Cable', 'TV', 'Projector'], default: [] },
        price: { type: Number, required: false, min: 0 },
    },
    { timestamps: true }
);

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateHubInput:
 *       type: object
 *       required:
 *         - roomNumber
 *         - capacity
 *       properties:
 *         roomNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 4  
 *           example: 1
 *         capacity:
 *           type: string
 *           enum: [ "1-2", "3-5", "6-10"]
 *           example: "3-5"
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *             enum: [ "Cable", "TV", "Projector" ]
 */
export const createHubsZSchema = z.object({
    roomNumber: z.number().int().min(1).max(4),
    capacity: z.enum(['1-2', '3-5', '6-10', '10']),
    equipment: z.array(z.enum(['Cable', 'TV', 'Projector'])).optional(),
    //price: z.number().min(0).optional(),
});

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateHubInput:
 *       type: object
 *       properties:
 *         roomNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 4  
 *           example: 1
 *         capacity:
 *           type: string
 *           enum: [ "1-2", "3-5", "6-10"]
 *           example: "3-5"
 *         equipment:
 *           type: array
 *           items:
 *             type: string
 *             enum: [ "Cable", "TV", "Projector" ]
 */
export const updateHubsZSchema = z.object({
    roomNumber: z.number().int().min(1).max(4).optional(),
    capacity: z.enum(['1-2', '3-5', '6-10', '10']).optional(),
    equipment: z.array(z.enum(['Cable', 'TV', 'Projector'])).optional(),
    //price: z.number().min(0).optional(),
});

export const HubModel = model<IHub>('Hub', hubSchema);
