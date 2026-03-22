import React, { useEffect, useState } from 'react';
import { mediaAPI, MediaPost, MediaPostRequest } from '../services/api';

const emptyForm: MediaPostRequest = {
  title: '',
  content: '',
  image_url: '',
  platform: 'news',
  publish_date: new Date().toISOString(),
  tags: '',
  is_published: true,
  is_featured: false,
};

export default function AdminMediaManager() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [form, setForm] = useState<MediaPostRequest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await mediaAPI.getAll();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await mediaAPI.update(editingId, { ...form, platform: 'news' });
      } else {
        await mediaAPI.create({ ...form, platform: 'news' });
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchPosts();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: MediaPost) => {
    setForm({
      title: post.title,
      content: post.content,
      image_url: post.image_url || '',
      platform: 'news',
      publish_date: post.publish_date,
      tags: post.tags || '',
      is_published: post.is_published,
      is_featured: post.is_featured || false,
    });
    setEditingId(post.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Slet denne opdatering?')) return;
    setLoading(true);
    setError(null);
    try {
      await mediaAPI.delete(id);
      fetchPosts();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Nyheder & Opdateringer</h2>
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Titel"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Tekst til opdatering"
          className="w-full border p-2 rounded"
          rows={3}
          required
        />
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Billede-URL (valgfrit)"
          className="w-full border p-2 rounded"
        />
        <div className="flex items-center gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_published"
              checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
              className="mr-2"
            />
            Offentliggjort
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured || false}
              onChange={e => setForm({ ...form, is_featured: e.target.checked })}
              className="mr-2"
            />
            Fremhævet på forsiden
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {editingId ? 'Opdater' : 'Opret'}
          </button>
          {editingId && (
            <button
              type="button"
              className="ml-2 text-gray-600 underline"
              onClick={() => { setForm(emptyForm); setEditingId(null); }}
            >
              Annuller
            </button>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
      </form>
      <div className="mt-8">
        {loading && <div>Indlæser...</div>}
        {posts.map(post => (
          <div key={post.id} className="bg-gray-50 p-4 rounded shadow mb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => handleEdit(post)}
                >Rediger</button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDelete(post.id)}
                >Slet</button>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-2">{new Date(post.publish_date).toLocaleString()}</div>
            <div>{post.content}</div>
            {post.image_url && (
              <img src={post.image_url} alt="Billede" className="mt-2 max-h-48 rounded" />
            )}
            {!post.is_published && <div className="text-xs text-yellow-600 mt-2">(Ikke offentliggjort)</div>}
          </div>
        ))}
      </div>
    </div>
  );
} 
