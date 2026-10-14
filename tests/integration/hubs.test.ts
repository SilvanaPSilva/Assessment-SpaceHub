import request from "supertest";
import { app } from "../../src/app";
import mongoose from 'mongoose';

describe('GET /hubs', () => {
  it('returns all hubs', async () => {
    const response = await request(app)
      .get('/api/v1/hubs');
    expect(response.status).toBe(200);
  });
});

describe('Hub CRUD lifecycle', () => {
  it('should create, retrieve, update and delete a Hub', async () => {
    const hubData = {
      roomNumber: 1,
      capacity: '1-2',
      equipment: ['Cable', 'Projector']
    };

    let hubId: string | undefined;

    try {
      // 1. Create a hub
      const created = await request(app)
        .post('/api/v1/hubs')
        .set('x-api-key', 'blahblah')
        .send(hubData);

      hubId = created.body._id;

      expect(created.status).toBe(201);
      expect(hubId).toEqual(expect.any(String));
      expect(created.body).toMatchObject(hubData);
      expect(created.body.price).toBe(100);

      // 2. Retrieve it and check its data
      const retrieved = await request(app)
        .get(`/api/v1/hubs/${hubId}`);

      expect(retrieved.status).toBe(200);
      expect(retrieved.body).toMatchObject({
        _id: hubId,
        ...hubData
      });

      // 3. Update it
      const updatedData = {
        ...hubData,
        capacity: '3-5',
        equipment: ['TV']
      };

      const updated = await request(app)
        .put(`/api/v1/hubs/${hubId}`)
        .set('x-api-key', 'blahblah')
        .send(updatedData);

      expect(updated.status).toBe(200);
      expect(updated.body.price).toBe(250);
      expect(updated.body).toMatchObject({
        _id: hubId,
        ...updatedData
      });

      // 4. Delete it
      const deleted = await request(app)
        .delete(`/api/v1/hubs/${hubId}`)
        .set('x-api-key', 'blahblah');

      expect(deleted.status).toBe(200);
      expect(deleted.body.message).toBe('Hub deleted successfully');
      expect(deleted.body.data._id).toBe(hubId);

      // 5. Confirm that it no longer exists
      const missing = await request(app)
        .get(`/api/v1/hubs/${hubId}`);

      expect(missing.status).toBe(404);
      expect(missing.body.message).toBe('Hub not found');
    } finally {

      // Clean up this test's hub even if an assertion fails
      if (hubId) {
        await request(app)
          .delete(`/api/v1/hubs/${hubId}`)
          .set('x-api-key', 'blahblah');
      }
    }
  });//close it
}); //close describe

//test no api key for post request
describe('Hub API error responses', () => {
  it('should reject a POST without an API key', async () => {
    const response = await request(app)
      .post('/api/v1/hubs')
      //.set('x-api-key', 'blahblah')
      .send({
        roomNumber: 1,
        capacity: "3-5",
        equipment: ['Cable', 'TV', 'Projector']
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Unauthorized: Missing api-key header'
    );
  });

  //test invalid equipment POST REQUEST
  it('should reject a POST with an invalid equipment', async () => {
    const response = await request(app)
      .post('/api/v1/hubs')
      .set('x-api-key', 'blahblah')
      .send({
        roomNumber: 1,
        capacity: "3-5",
        equipment: ["laptop"]
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['equipment', 0],
        })
      ])
    );
  });
  
  //Delete inexisting hub
  it('should return 404 when deleting a non-existent hub', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .delete(`/api/v1/hubs/${missingId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Hub not found');
  });

  //test update invalid INVALID HUB for PUT REQUEST
  it('should return 404 when updating a non-existent hub', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();//fake id
    const response = await request(app)
      .put(`/api/v1/hubs/${missingId}`)
      .set('x-api-key', 'blahblah')
      .send({
        roomNumber: 1,
        capacity: "3-5",
        equipment: ['Cable', 'TV', 'Projector']
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Hub not found');
  });

  //test unauthorized PUT REQUEST
  it('should return 401 when updating a hub without an API key', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app)
      .put(`/api/v1/hubs/${missingId}`)
      //.set('x-api-key', 'blahblah')
      .send({
        roomNumber: 1,
        capacity: "3-5",
        equipment: ['Cable', 'TV', 'Projector']
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized: Missing api-key header');
  });

  //test invalid roomNumber for PUT REQUEST
  it('should return 400 when updating a hub with an invalid roomNumber', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/v1/hubs/${missingId}`)
      .set('x-api-key', 'blahblah')
      .send({
        roomNumber: 11,
        capacity: "3-5",
        equipment: ['Cable', 'TV', 'Projector']
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });

});