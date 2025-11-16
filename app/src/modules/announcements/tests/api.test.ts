import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/announcements'; // This file doesn't exist yet
import { getDb } from '@/core/lib/db';

// Mock the db connection
jest.mock('@/core/lib/db');

describe('/api/announcements API Endpoint', () => {
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
    it('should return a list of announcements', async () => {
      const mockAnnouncements = [
        { id: 1, title: 'Test 1', content: 'Content 1' },
        { id: 2, title: 'Test 2', content: 'Content 2' },
      ];
      db.all.mockResolvedValue(mockAnnouncements);

      const { req, res } = createMocks({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockAnnouncements);
      expect(db.all).toHaveBeenCalledWith('SELECT * FROM announcements ORDER BY createdAt DESC');
    });
  });

  describe('POST', () => {
    it('should create a new announcement', async () => {
      const newAnnouncement = { title: 'New Title', content: 'New Content' };
      db.run.mockResolvedValue({ lastID: 3 });

      const { req, res } = createMocks({
        method: 'POST',
        body: newAnnouncement,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({ id: 3, ...newAnnouncement });
      expect(db.run).toHaveBeenCalledWith(
        'INSERT INTO announcements (title, content) VALUES (?, ?)',
        'New Title',
        'New Content'
      );
    });

    it('should return 400 if title or content is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { title: 'Only Title' }, // Missing content
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Title and content are required' });
    });
  });
});