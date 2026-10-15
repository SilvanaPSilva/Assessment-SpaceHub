import request from "supertest";
import { app } from "../../src/app";
import mongoose from 'mongoose';

describe('GET /bookings', () => {
  it('returns all bookings', async () => {
    const response = await request(app)
      .get('/api/v1/bookings');
    expect(response.status).toBe(200);
  });
});

describe('Bookings CRUD lifecycle', () => {
  it('Should create, retrieve, update and delete a bookings', async () => {
    //1. Create Hub
    const createdHub = await request(app)
      .post('/api/v1/hubs')
      .set('x-api-key', 'blahblah')
      .send({
        roomNumber: 1,
        capacity: '1-2',
        equipment: ['Cable', 'Projector']
      });

    expect(createdHub.status).toBe(201);

    const hubIdTest = createdHub.body._id;

    const bookingsData = {
      hubId: hubIdTest,
      checking: '2026-11-01',
      checkout: '2026-11-04'
    };

    //1.1 Create a Booking Id - Store the booking ID for later requests and cleanup.
    let bookingsId: string | undefined;

    try {
      // 1.2 Create a Booking
      const created = await request(app)
        .post('/api/v1/bookings')
        .set('x-api-key', 'blahblah')
        .send(bookingsData);

      bookingsId = created.body._id;

      expect(created.status).toBe(201);
      expect(bookingsId).toEqual(expect.any(String));
      expect(created.body.hubId).toBe(hubIdTest);
      //expect(created.body).toMatchObject(bookingsData);
      //Compare only YYYY-MM-DD because MongoDB returns the date with a time.      
      expect(created.body.checking.slice(0, 10)).toBe(bookingsData.checking);
      expect(created.body.checkout.slice(0, 10)).toBe(bookingsData.checkout);
      expect(created.body.totalDays).toBe(3);
      expect(created.body.invoice).toBe(300);

      // 2. Retrieve it and check its data
      const retrieved = await request(app)
        .get(`/api/v1/bookings/${bookingsId}`);

      expect(retrieved.status).toBe(200);
      expect(retrieved.body._id).toBe(bookingsId);
      expect(retrieved.body.hubId).toBe(hubIdTest);
      //expect(retrieved.body).toMatchObject({ _id: bookingsId, ...bookingsData });
      //Compare only YYYY-MM-DD because MongoDB returns the date with a time.
      expect(retrieved.body.checking.slice(0, 10)).toBe(bookingsData.checking);
      expect(retrieved.body.checkout.slice(0, 10)).toBe(bookingsData.checkout);
      expect(retrieved.body.totalDays).toBe(3);
      expect(retrieved.body.invoice).toBe(300);

      // 3. Update it
      const updatedData = {
        ...bookingsData,
        checking: '2026-11-01',
        checkout: '2026-11-07'
      };

      const updated = await request(app)
        .put(`/api/v1/bookings/${bookingsId}`)
        .set('x-api-key', 'blahblah')
        .send(updatedData);

      expect(updated.status).toBe(200);
      expect(updated.body._id).toBe(bookingsId);
      expect(updated.body.hubId).toBe(hubIdTest);
      //expect(updated.body).toMatchObject({_id: bookingsId, ...updatedData });
      //Compare only YYYY-MM-DD because MongoDB returns the date with a time.
      expect(updated.body.checking.slice(0, 10)).toBe(updatedData.checking);
      expect(updated.body.checkout.slice(0, 10)).toBe(updatedData.checkout);
      expect(updated.body.totalDays).toBe(6);
      expect(updated.body.invoice).toBe(600);

      // 4. Delete it
      const deleted = await request(app)
        .delete(`/api/v1/bookings/${bookingsId}`)
        .set('x-api-key', 'blahblah');

      expect(deleted.status).toBe(200);
      expect(deleted.body.message).toBe('Booking deleted successfully');
      expect(deleted.body.data._id).toBe(bookingsId);

      // 5. Confirm that it no longer exists
      const missing = await request(app)
        .get(`/api/v1/bookings/${bookingsId}`);

      expect(missing.status).toBe(404);
      expect(missing.body.message).toBe('Booking not found');
    } finally {

      // Delete the booking created by this test, even if the test fails
      if (bookingsId) {
        await request(app)
          .delete(`/api/v1/bookings/${bookingsId}`)
          .set('x-api-key', 'blahblah');
      }

      //Delete the hub created for this test.
      await request(app).delete (`/api/v1/hubs/${hubIdTest}`);      
    }
    
  });//close it
}); //close describe

//test no api key for post request
describe('Bookings API error responses', () => {

  it('should reject a POST without an API key', async () => {
    const response = await request(app)
      .post('/api/v1/bookings')
      //.set('x-api-key', 'blahblah')
      .send({
        hubId: '507f1f77bcf86cd799439011',
        checking: '2026-11-01',
        checkout: '2026-11-04'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Missing api-key header');
  });

  //test invalid checkout date POST REQUEST
  it('should reject dates that do not use YYYY-MM-DD format', async () => {

    //#chatGPT
    const invalidDates = [
      { checking: '01-11-2026', checkout: '2026-11-07', field: 'checking' },
      { checking: '2026-11-01', checkout: '07-11-2026', field: 'checkout' }
    ]
    //#chatGPT
    for (const dates of invalidDates) {
      const response = await request(app)
        .post('/api/v1/bookings')
        .set('x-api-key', 'blahblah')
        .send({
          hubId: '507f1f77bcf86cd799439011',
          checking: dates.checking,
          checkout: dates.checkout
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: [dates.field],//chatGPT
          })
        ])
      );
    }
  });

  //Delete inexisting hub
  it('should return 404 when deleting a non-existent booking', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .delete(`/api/v1/bookings/${missingId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Booking not found');
  });

  //test update invalid INVALID Booking for PUT REQUEST
  it('should return 404 when updating a non-existent booking', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();//Fake id
    const response = await request(app)
      .put(`/api/v1/bookings/${missingId}`)
      .set('x-api-key', 'blahblah')
      .send({
        hubId: '507f1f77bcf86cd799439011',
        checking: '2026-11-01',
        checkout: '2026-11-07'
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Booking not found');
  });

  //test unauthorized PUT REQUEST
  it('should return 401 when updating a bookings without an API key', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .put(`/api/v1/bookings/${missingId}`)
      //.set('x-api-key', 'blahblah')
      .send({
        hubId: '507f1f77bcf86cd799439011',//fake_id
        checking: '2026-11-01',
        checkout: '2026-11-07'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Missing api-key header');
  });

  //test empty checking date for PUT REQUEST
  it('should return 400 when updating a bookings with an  empty checking date', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/v1/bookings/${missingId}`)
      .set('x-api-key', 'blahblah')
      .send({        
        hubId: '507f1f77bcf86cd799439011',//fake_id
        checking: ' ',
        checkout: '2026-11-07'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

  //test empty checkout date for PUT REQUEST
  it('should return 400 when updating a bookings with an  empty checkout date', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/v1/bookings/${missingId}`)
      .set('x-api-key', 'blahblah')
      .send({
        hubId: '507f1f77bcf86cd799439011',//fake_id
        checking: '2026-11-07',
        checkout: ' '
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

});