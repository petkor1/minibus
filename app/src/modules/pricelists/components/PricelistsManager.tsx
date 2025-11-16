import React, { useState, useEffect } from 'react';

interface Pricelist {
  id?: number;
  name: string;
  content: string;
}

const PricelistsManager: React.FC = () => {
  const [pricelists, setPricelists] = useState<Pricelist[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [editingPricelist, setEditingPricelist] = useState<Pricelist | null>(null);

  useEffect(() => {
    fetchPricelists();
  }, []);

  const fetchPricelists = async () => {
    const res = await fetch('/api/pricelists');
    const data = await res.json();
    setPricelists(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPricelist) {
      // Update existing pricelist
      const res = await fetch('/api/pricelists', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: editingPricelist.id, name, content }),
      });
      if (res.ok) {
        fetchPricelists();
        setName('');
        setContent('');
        setEditingPricelist(null);
      }
    } else {
      // Create new pricelist
      const res = await fetch('/api/pricelists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, content }),
      });
      if (res.ok) {
        fetchPricelists();
        setName('');
        setContent('');
      }
    }
  };

  const handleEdit = (pricelist: Pricelist) => {
    setName(pricelist.name);
    setContent(pricelist.content);
    setEditingPricelist(pricelist);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/pricelists?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchPricelists();
    }
  };

  return (
    <div>
      <h1>Pricelists Manager</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">
          {editingPricelist ? 'Save Changes' : 'Add Pricelist'}
        </button>
      </form>

      <h2>Existing Pricelists</h2>
      <ul>
        {pricelists.map((pricelist) => (
          <li key={pricelist.id}>
            <h3>{pricelist.name}</h3>
            <p>{pricelist.content}</p>
            <button onClick={() => handleEdit(pricelist)}>Edit</button>
            <button onClick={() => pricelist.id && handleDelete(pricelist.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricelistsManager;
