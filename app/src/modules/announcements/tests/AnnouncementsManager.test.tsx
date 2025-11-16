import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnouncementsManager from '../components/AnnouncementsManager'; // This component doesn't exist yet

// Mock the global fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('AnnouncementsManager Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should display existing announcements on load', async () => {
    const mockAnnouncements = [
      { id: 1, title: 'First Announcement', content: 'Hello World' },
      { id: 2, title: 'Second Announcement', content: 'Testing RTL' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnnouncements,
    });

    render(<AnnouncementsManager />);

    // Wait for the announcements to be displayed
    await waitFor(() => {
      expect(screen.getByText('First Announcement')).toBeInTheDocument();
      expect(screen.getByText('Testing RTL')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/announcements');
  });

  it('should allow creating a new announcement', async () => {
    // Initial fetch is empty
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    
    // Mock the POST request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, title: 'New Post', content: 'From test' }),
    });

    render(<AnnouncementsManager />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Post' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'From test' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add announcement/i }));

    // Wait for the new announcement to appear in the list
    await waitFor(() => {
      expect(screen.getByText('New Post')).toBeInTheDocument();
    });

    // Check if the POST request was made correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'New Post', content: 'From test' }),
    });
  });
});
