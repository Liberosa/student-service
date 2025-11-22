// Integration tests for studentController via router using Supertest (ESM + mocked service)
import {jest, describe, beforeEach, test, expect} from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the service layer to avoid any DB operations
const serviceFns = {
  addStudent: jest.fn(),
  findStudent: jest.fn(),
  deleteStudent: jest.fn(),
  updateStudent: jest.fn(),
  addScore: jest.fn(),
  findByName: jest.fn(),
  countByNames: jest.fn(),
  findByMinScore: jest.fn(),
};

await jest.unstable_mockModule('../service/studentService.js', () => ({
  __esModule: true,
  ...serviceFns,
}));

// Import after mocks are set up
const {default: router} = await import('../routes/studentRoutes.js');
const service = await import('../service/studentService.js');

// Build an express app and mount the router
const app = express();
app.use(express.json());
app.use(router);

describe('studentController (integration with router)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /student', () => {
    test('returns 201 when student is created', async () => {
      service.addStudent.mockResolvedValue(true);

      const payload = {id: 1, name: 'Alice', password: 'secret'};
      const res = await request(app)
        .post('/student')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(service.addStudent).toHaveBeenCalledWith(payload);
    });

    test('returns 409 when student already exists', async () => {
      service.addStudent.mockResolvedValue(false);

      const res = await request(app)
        .post('/student')
        .send({id: 1, name: 'Alice', password: 'secret'})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(409);
    });

    test('returns 400 on validation error', async () => {
      // Missing required field "name"
      const res = await request(app)
        .post('/student')
        .send({id: 2, password: 'x'})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/"name" is required/);
      expect(service.addStudent).not.toHaveBeenCalled();
    });

    test('returns 500 when service throws unexpected error', async () => {
      service.addStudent.mockRejectedValue(new Error('Service failure'));

      const res = await request(app)
        .post('/student')
        .send({id: 1, name: 'Alice', password: 'secret'})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /student/:id', () => {
    test('returns 200 with student when found', async () => {
      const student = {_id: 1, name: 'Bob'};
      service.findStudent.mockResolvedValue(student);

      const res = await request(app).get('/student/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(student);
      expect(service.findStudent).toHaveBeenCalledWith(1);
    });

    test('calls service with NaN when id is not a number', async () => {
      service.findStudent.mockResolvedValue(null);
      // "abc" converted to number is NaN
      await request(app).get('/student/abc');
      expect(service.findStudent).toHaveBeenCalledWith(NaN);
    });

    test('returns 404 when student not found', async () => {
      service.findStudent.mockResolvedValue(null);

      const res = await request(app).get('/student/404');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /student/:id', () => {
    test('returns 200 with updated student', async () => {
      const updated = {_id: 1, name: 'Bobby'};
      service.updateStudent.mockResolvedValue(updated);

      const res = await request(app)
        .patch('/student/1')
        .send({name: 'Bobby'})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
      expect(service.updateStudent).toHaveBeenCalledWith(1, {name: 'Bobby'});
    });

    test('returns 404 when student to update not found', async () => {
      service.updateStudent.mockResolvedValue(null);

      const res = await request(app)
        .patch('/student/2')
        .send({name: 'Nope'})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(404);
    });

    test('returns 400 on invalid body (validation error)', async () => {
      // name must be string -> send number to trigger Joi error
      const res = await request(app)
        .patch('/student/1')
        .send({name: 123})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/"name" must be a string/);
      expect(service.updateStudent).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /student/:id', () => {
    test('returns 200 with deleted student payload when found', async () => {
      const deleted = {_id: 7, name: 'Tom'};
      service.deleteStudent.mockResolvedValue(deleted);

      const res = await request(app).delete('/student/7');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(deleted);
      expect(service.deleteStudent).toHaveBeenCalledWith(7);
    });

    test('returns 404 when not found', async () => {
      service.deleteStudent.mockResolvedValue(null);
      const res = await request(app).delete('/student/8');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /score/student/:id', () => {
    test('returns 204 when score added', async () => {
      service.addScore.mockResolvedValue(true);

      const res = await request(app)
        .patch('/score/student/3')
        .send({examName: 'math', score: 95})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(204);
      expect(service.addScore).toHaveBeenCalledWith(3, 'math', 95);
    });

    test('returns 404 when score update target not found', async () => {
      service.addScore.mockResolvedValue(false);

      const res = await request(app)
        .patch('/score/student/3')
        .send({examName: 'math', score: 95})
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(404);
    });

    test('returns 400 on validation error', async () => {
      const res = await request(app)
        .patch('/score/student/3')
        .send({examName: 'math', score: 101}) // out of range
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(service.addScore).not.toHaveBeenCalled();
    });
  });

  describe('GET /students/name/:name', () => {
    test('returns 200 with array', async () => {
      const arr = [{_id: 1, name: 'Ann'}, {_id: 2, name: 'ANN'}];
      service.findByName.mockResolvedValue(arr);

      const res = await request(app).get('/students/name/Ann');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(arr);
      expect(service.findByName).toHaveBeenCalledWith('Ann');
    });
  });

  describe('GET /quantity/students', () => {
    test('supports multiple names query parameters', async () => {
      service.countByNames.mockResolvedValue(2);

      const res = await request(app).get('/quantity/students?names=Ann&names=Bob');

      expect(res.status).toBe(200);
      // res.body is parsed JSON; for simple number it will be 2
      expect(res.body).toBe(2);
      expect(service.countByNames).toHaveBeenCalledWith(['Ann', 'Bob']);
    });

    test('supports single name query parameter', async () => {
      service.countByNames.mockResolvedValue(1);

      const res = await request(app).get('/quantity/students?names=Ann');

      expect(res.status).toBe(200);
      expect(res.body).toBe(1);
      // Controller should wrap single string in array
      expect(service.countByNames).toHaveBeenCalledWith(['Ann']);
    });
  });

  describe('GET /students/exam/:exam/minscore/:minScore', () => {
    test('returns 200 with array of students', async () => {
      const arr = [
        {_id: 1, name: 'Max', scores: {math: 80}},
        {_id: 2, name: 'Lux', scores: {math: 85}},
      ];
      service.findByMinScore.mockResolvedValue(arr);

      const res = await request(app).get('/students/exam/math/minscore/80');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(arr);
      expect(service.findByMinScore).toHaveBeenCalledWith('math', 80);
    });
  });
});
