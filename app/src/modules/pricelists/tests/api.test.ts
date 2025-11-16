import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/pricelists'; // This file doesn't exist yet
import { getDb } from '@/core/lib/db';

// Mock the db connection
jest.mock('@/core/lib/db');

describe('/api/pricelists API Endpoint', () => {
  let db;

  beforeEach(async () => {
    // Reset the mock before each test
    jest.clearAllMocks();
    
    // Set up a mock database connection
    db = {
      all: jest.fn(),
      run: jest.fn(),
      get: jest.fn(),
    };
    (getDb as jest.Mock).mockResolvedValue(db);
  });

  describe('GET', () => {
    it('should return a list of pricelists', async () => {
      const mockPricelists = [
        { id: 1, name: 'Standard', content: 'Content 1' },
        { id: 2, name: 'Premium', content: 'Content 2' },
      ];
      db.all.mockResolvedValue(mockPricelists);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockPricelists);
      expect(db.all).toHaveBeenCalledWith('SELECT * FROM pricelists ORDER BY updatedAt DESC');
    });
  });

  describe('POST', () => {
    it('should create a new pricelist', async () => {
      const newPricelist = { name: 'New Pricelist', content: 'New Content' };
      db.run.mockResolvedValue({ lastID: 3 });

      const { req, res } = createMocks({
        method: 'POST',
        body: newPricelist,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({ id: 3, ...newPricelist });
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO pricelists (name, content) VALUES (?, ?)',
        'New Pricelist',
        'New Content'
      );
    });

    it('should return 400 if name or content is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { name: 'Only Name' }, // Missing content
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Name and content are required' });
    });
  });

  describe('PUT', () => {
    it('should update an existing pricelist', async () => {
      const updatedPricelist = { id: 1, name: 'Updated Pricelist', content: 'Updated Content' };
      db.run.mockResolvedValue({ changes: 1 });

      const { req, res } = createMocks({
        method: 'PUT',
        body: updatedPricelist,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Pricelist updated' });
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE pricelists SET name = ?, content = ? WHERE id = ?',
        'Updated Pricelist',
        'Updated Content',
        1
      );
    });

    it('should return 400 if id, name or content is missing', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        body: { id: 1, name: 'Only Name' }, // Missing content
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'ID, name and content are required' });
    });

    it('should return 404 if pricelist not found', async () => {
      const updatedPricelist = { id: 99, name: 'Updated Pricelist', content: 'Updated Content' };
      db.run.mockResolvedValue({ changes: 0 });

      const { req, res } = createMocks({
        method: 'PUT',
        body: updatedPricelist,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Pricelist not found' });
    });
  });

  describe('DELETE', () => {
    it('should delete an existing pricelist', async () => {
      db.run.mockResolvedValue({ changes: 1 });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Pricelist deleted' });
      expect(db.run).toHaveBeenCalledWith('DELETE FROM pricelists WHERE id = ?', 1);
    });

    it('should return 400 if id is missing', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Pricelist ID is required' });
    });

    it('should return 404 if pricelist not found', async () => {
      db.run.mockResolvedValue({ changes: 0 });

      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '99' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Pricelist not found' });
    });
  });
});
