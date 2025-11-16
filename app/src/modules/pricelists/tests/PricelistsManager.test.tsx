import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricelistsManager from '../components/PricelistsManager';

// Mock the global fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('PricelistsManager Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should display existing pricelists on load', async () => {
    const mockPricelists = [
      { id: 1, name: 'Standard Pricelist', content: 'Details for standard' },
      { id: 2, name: 'Premium Pricelist', content: 'Details for premium' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPricelists,
    });

    render(<PricelistsManager />);

    await waitFor(() => {
      expect(screen.getByText('Standard Pricelist')).toBeInTheDocument();
      expect(screen.getByText('Details for premium')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/pricelists');
  });

  it('should allow creating a new pricelist', async () => {
    // Mock initial GET request (empty list)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    
    // Mock POST request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: 'New Pricelist', content: 'From test' }),
    });

    // Mock GET request after POST to refresh the list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 3, name: 'New Pricelist', content: 'From test' }],
    });

    render(<PricelistsManager />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New Pricelist' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'From test' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add pricelist/i }));

    await waitFor(() => {
      expect(screen.getByText('New Pricelist')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/pricelists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New Pricelist', content: 'From test' }),
    });
  });

  it('should allow updating an existing pricelist', async () => {
    const initialPricelists = [
      { id: 1, name: 'Old Pricelist', content: 'Old Content' },
    ];
    const updatedPricelists = [
      { id: 1, name: 'Updated Pricelist', content: 'Updated Content' },
    ];

    // Mock initial GET request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => initialPricelists,
    });

    // Mock PUT request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Pricelist updated' }),
    });

    // Mock GET request after PUT to refresh the list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedPricelists,
    });

    render(<PricelistsManager />);

    await waitFor(() => {
      expect(screen.getByText('Old Pricelist')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Updated Pricelist' },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: 'Updated Content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Updated Pricelist')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/pricelists', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 1, name: 'Updated Pricelist', content: 'Updated Content' }),
    });
  });

  it('should allow deleting an existing pricelist', async () => {
    const initialPricelists = [
      { id: 1, name: 'Pricelist to Delete', content: 'Content to delete' },
    ];
    const afterDeletePricelists: Pricelist[] = [];

    // Mock initial GET request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => initialPricelists,
    });

    // Mock DELETE request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Pricelist deleted' }),
    });

    // Mock GET request after DELETE to refresh the list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => afterDeletePricelists,
    });

    render(<PricelistsManager />);

    await waitFor(() => {
      expect(screen.getByText('Pricelist to Delete')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Pricelist to Delete')).not.toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/pricelists?id=1', {
      method: 'DELETE',
    });
  });
});