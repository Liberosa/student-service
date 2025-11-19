// Tests for studentService.js using Jest and repository mocks (ESM)
import { jest,describe,beforeEach,test,expect } from '@jest/globals';

// Create a mock for the repository module before importing the service
const repoFns = {
  createStudent: jest.fn(),
  findStudentById: jest.fn(),
  deleteStudentById: jest.fn(),
  updateStudent: jest.fn(),
  updateStudentScore: jest.fn(),
  findStudentByName: jest.fn(),
  countStudentsByNames: jest.fn(),
  findStudentsByMinScore: jest.fn(),
};

await jest.unstable_mockModule('../repository/studentRepository.js', () => ({
  __esModule: true,
  ...repoFns,
}));

// Динамический импорт после моков
const service = await import('../service/studentService.js');
const repo = await import('../repository/studentRepository.js');

describe('studentService', () => {
  beforeEach(() => {
    // Use standard Jest method to clear all mocks
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    test('возвращает false, если студент уже существует', async () => {
      repo.findStudentById.mockResolvedValue({ _id: '1' });

      const result = await service.addStudent({ id: '1', name: 'Ann', password: 'p' });

      expect(result).toBe(false);
      expect(repo.findStudentById).toHaveBeenCalledWith('1');
      expect(repo.createStudent).not.toHaveBeenCalled();
    });

    test('creates student and returns true if does not exist', async () => {
      repo.findStudentById.mockResolvedValue(null);
      repo.createStudent.mockResolvedValue({ _id: '2', name: 'Bob' });

      const result = await service.addStudent({ id: '2', name: 'Bob', password: 'secret' });

      expect(result).toBe(true);
      expect(repo.findStudentById).toHaveBeenCalledWith('2');
      expect(repo.createStudent).toHaveBeenCalledWith({ _id: '2', name: 'Bob', password: 'secret' });
    });

    test('propagates error if repository throws exception', async () => {
      repo.findStudentById.mockResolvedValue(null);
      const dbError = new Error('DB Connection Failed');
      repo.createStudent.mockRejectedValue(dbError);

      await expect(service.addStudent({ id: '3', name: 'Err' }))
          .rejects.toThrow('DB Connection Failed');
    });
  });

  describe('findStudent', () => {
    test('removes password from the found student', async () => {
      repo.findStudentById.mockResolvedValue({ _id: '3', name: 'Kate', password: 'pwd' });

      const student = await service.findStudent('3');

      expect(repo.findStudentById).toHaveBeenCalledWith('3');
      expect(student).toEqual({ _id: '3', name: 'Kate', password: undefined });
    });

    test('returns null/undefined as is if not found', async () => {
      repo.findStudentById.mockResolvedValue(null);

      const student = await service.findStudent('404');
      expect(student).toBeNull();
    });
  });

  describe('deleteStudent', () => {
    test('removes password from the returned object', async () => {
      repo.deleteStudentById.mockResolvedValue({ _id: '5', name: 'Tom', password: 'x' });

      const result = await service.deleteStudent('5');

      expect(repo.deleteStudentById).toHaveBeenCalledWith('5');
      expect(result).toEqual({ _id: '5', name: 'Tom', password: undefined });
    });

    test('returns null if nothing was deleted', async () => {
      repo.deleteStudentById.mockResolvedValue(null);

      const result = await service.deleteStudent('6');
      expect(result).toBeNull();
    });
  });

  describe('updateStudent', () => {
    test('sets scores field to undefined in returned object', async () => {
      const updated = { _id: '7', name: 'Ivy', scores: { math: 90 } };
      repo.updateStudent.mockResolvedValue({ ...updated });

      const result = await service.updateStudent('7', { name: 'Ivy' });

      expect(repo.updateStudent).toHaveBeenCalledWith('7', { name: 'Ivy' });
      expect(result).toEqual({ _id: '7', name: 'Ivy', scores: undefined });
    });

    test('proxies null if student not found', async () => {
      repo.updateStudent.mockResolvedValue(null);

      const result = await service.updateStudent('8', { name: 'N/A' });
      expect(result).toBeNull();
    });
  });

  describe('addScore', () => {
    test('delegates to updateStudentScore and returns its result', async () => {
      repo.updateStudentScore.mockResolvedValue({ acknowledged: true });

      const res = await service.addScore('9', 'math', 100);

      expect(repo.updateStudentScore).toHaveBeenCalledWith('9', 'math', 100);
      expect(res).toEqual({ acknowledged: true });
    });
  });

  describe('findByName', () => {
    test('removes password from each found student', async () => {
      const arr = [
        { _id: '10', name: 'Ann', password: 'a' },
        { _id: '11', name: 'ANN', password: 'b' },
      ];
      repo.findStudentByName.mockResolvedValue(arr);

      const res = await service.findByName('Ann');

      expect(repo.findStudentByName).toHaveBeenCalledWith('Ann');
      expect(res).toEqual([
        { _id: '10', name: 'Ann', password: undefined },
        { _id: '11', name: 'ANN', password: undefined },
      ]);
    });

    test('correctly handles empty array (does not crash)', async () => {
      repo.findStudentByName.mockResolvedValue([]);
      const res = await service.findByName('Ghost');
      expect(res).toEqual([]);
    });

    test('returns as is if not an array (e.g. null)', async () => {
      repo.findStudentByName.mockResolvedValue(null);
      const res = await service.findByName('Nobody');
      expect(res).toBeNull();
    });
  });

  describe('countByNames', () => {
    test('delegates to countStudentsByNames', async () => {
      repo.countStudentsByNames.mockResolvedValue(3);
      const names = ['Ann', 'Bob'];

      const count = await service.countByNames(names);

      expect(repo.countStudentsByNames).toHaveBeenCalledWith(names);
      expect(count).toBe(3);
    });
  });

  describe('findByMinScore', () => {
    test('removes password from each found student', async () => {
      const arr = [
        { _id: '12', name: 'Max', password: 'p1', scores: { math: 80 } },
        { _id: '13', name: 'Lux', password: 'p2', scores: { math: 85 } },
      ];
      repo.findStudentsByMinScore.mockResolvedValue(arr);

      const res = await service.findByMinScore('math', 80);

      expect(repo.findStudentsByMinScore).toHaveBeenCalledWith('math', 80);
      expect(res).toEqual([
        { _id: '12', name: 'Max', password: undefined, scores: { math: 80 } },
        { _id: '13', name: 'Lux', password: undefined, scores: { math: 85 } },
      ]);
    });

    test('correctly handles empty array', async () => {
      repo.findStudentsByMinScore.mockResolvedValue([]);
      const res = await service.findByMinScore('math', 999);
      expect(res).toEqual([]);
    });

    test('returns as is if not an array (e.g. null)', async () => {
      repo.findStudentsByMinScore.mockResolvedValue(null);
      const res = await service.findByMinScore('math', 100);
      expect(res).toBeNull();
    });
  });
});
