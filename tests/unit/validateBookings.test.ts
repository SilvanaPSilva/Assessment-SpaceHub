import { createBookingsZSchema } from "../../src/models/bookings";

const validBooking = {
    hubId: "507f1f77bcf86cd799439011",
    checking: "2026-11-01",
    checkout: "2026-11-04"
}

describe('Test Booking Validation', () => {
    it('should pass for the following valid data', () => {
        expect(() => createBookingsZSchema.parse(
            validBooking)).not.toThrow();
    });

    it('should fail for a missing date', () => {
        expect(() => createBookingsZSchema.parse(
            { ...validBooking, "checking": undefined })).toThrow();

        expect(() => createBookingsZSchema.parse(
            { ...validBooking, "checkout": undefined })).toThrow();
    });

    it('should fail for an invalid date format', () => {
        expect(() => createBookingsZSchema.parse({
            ...validBooking, checking: "01/11/2026" })).toThrow();
    });

    it('should fail for missing hubId', () => {
        expect(() => createBookingsZSchema.parse(
            { ...validBooking, "hubId": undefined })).toThrow();
    });

    it('should fail for an empty hubId', () => {
        expect(() => createBookingsZSchema.parse(
            { ...validBooking, "hubId": '' })).toThrow();
    });

});
