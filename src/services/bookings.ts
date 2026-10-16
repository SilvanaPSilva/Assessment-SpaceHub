import { HydratedDocument } from 'mongoose';
import { BookingModel, IBooking } from '../models/bookings';
import { HubModel } from '../models/hubs'

export class BookingService {

  async createBooking(bookingData: IBooking): Promise<HydratedDocument<IBooking>> {
    //#region ChatGPT
    const checking = new Date(bookingData.checking);
    checking.setHours(0, 0, 0, 0);

    const checkout = new Date(bookingData.checkout);
    checkout.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //Validation Data
    if (Number.isNaN(checking.getTime()) || Number.isNaN(checkout.getTime())) {
      throw new Error('Invalid booking dates');
    }

    if (checking <= today) {
      throw new Error('Bookings must be made at least one day in advance.')
    }

    if (checking >= checkout) {
      throw new Error('Check-out must be after check-in.')
    }

    const totalDays = (Date.UTC(checkout.getFullYear(), checkout.getMonth(), checkout.getDate()) - Date.UTC(checking.getFullYear(), checking.getMonth(), checking.getDate())) / (1000 * 60 * 60 * 24);
    //#endregion ChatGPT

    const hubBooked = await HubModel.findById(bookingData.hubId);
    if (!hubBooked) {
      throw new Error("Hub not found")
    }
    if (hubBooked.price === undefined) {
      throw new Error("Hub price is not avaliable")
    }
    
    const invoice = totalDays * hubBooked.price;

    const booking = new BookingModel({ ...bookingData, totalDays, invoice });
    return await booking.save();
  }

  async getAllBooking(): Promise<IBooking[]> {
    return await BookingModel.find().lean();
  }

  async getBookingById(id: string): Promise<IBooking | null> {
    return await BookingModel.findById(id).lean();
  }

  async updateBookings(id: string, bookingData: Partial<IBooking>): Promise<IBooking | null> {

    const existingBooking = await BookingModel.findById(id);

    if (!existingBooking) {
      return null;
    }

    const checkingUpdate = new Date(bookingData.checking ?? existingBooking.checking);
    checkingUpdate.setHours(0, 0, 0, 0);

    const checkoutUpdate = new Date(bookingData.checkout ?? existingBooking.checkout);
    checkoutUpdate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(checkingUpdate.getTime()) || Number.isNaN(checkoutUpdate.getTime())) {
      throw new Error('Invalid booking dates');
    }

    if (checkingUpdate <= today) {
      throw new Error('Bookings must be made at least one day in advance.')
    }

    if (checkingUpdate >= checkoutUpdate) {
      throw new Error('Check-out must be after check-in.')
    }

    const totalDaysUpdate = (Date.UTC(checkoutUpdate.getFullYear(), checkoutUpdate.getMonth(), checkoutUpdate.getDate()) - Date.UTC(checkingUpdate.getFullYear(), checkingUpdate.getMonth(), checkingUpdate.getDate())) / (1000 * 60 * 60 * 24);

    const hubBooked_IdUpdate = bookingData.hubId ?? existingBooking.hubId;
    const hubBooked_Update = await HubModel.findById(hubBooked_IdUpdate);
    if (!hubBooked_Update) {
      throw new Error("Hub not found")
    }
    if (hubBooked_Update.price === undefined) {
      throw new Error("Hub price is not avaliable")
    }

    const invoice = totalDaysUpdate * hubBooked_Update.price;

    const updateBooking = { ...bookingData, hubId: hubBooked_IdUpdate, checking: checkingUpdate, checkout: checkoutUpdate, totalDays: totalDaysUpdate, invoice };
    return await BookingModel.findByIdAndUpdate(id, updateBooking, { returnDocument: 'after', runValidators: true }).lean();
  }

  async deleteBooking(id: string): Promise<IBooking | null> {
    return await BookingModel.findByIdAndDelete(id).lean();
  }
}