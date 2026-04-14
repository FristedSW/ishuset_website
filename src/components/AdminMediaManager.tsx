import React, { useEffect, useState } from 'react';
import { mediaAPI, MediaAsset, mediaAssetAPI, MediaPost, MediaPostRequest, resolveMediaUrl } from '../services/api';

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
  const [assets, setAssets] = useState<MediaAsset[]>([]);

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
    mediaAssetAPI.getAll().then((data) => setAssets(Array.isArray(data) ? data : [])).catch(() => setAssets([]));
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
    } catch (submitError: any) {
      setError(submitError.message);
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
    if (!window.confirm('Delete this update?')) return;
    setLoading(true);
    setError(null);
    try {
      await mediaAPI.delete(id);
      fetchPosts();
    } catch (submitError: any) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">News</h2>
        <p className="mt-2 text-sm text-stone-500">Create and manage the messages that appear on the public website.</p>
      </div>

      {error && <div className="rounded-[1.5rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="Image URL"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
        </div>

        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Text for the update"
          className="mt-4 min-h-32 w-full rounded-[1.5rem] border border-stone-200 px-4 py-3"
          required
        />

        <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4">
          <label className="block text-sm font-medium text-stone-700">Choose an image from the media library</label>
          <select
            value=""
            onChange={(e) => {
              const asset = assets.find((entry) => entry.id === Number(e.target.value));
              if (!asset) return;
              setForm((current) => ({ ...current, image_url: asset.file_url }));
            }}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="">Choose a saved image...</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </div>

        {form.image_url && (
          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-stone-100">
            <img src={resolveMediaUrl(form.image_url)} alt="News preview" className="h-52 w-full object-cover" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-[1.5rem] bg-stone-50 p-4 text-sm">
          <label className="flex items-center gap-3 text-stone-700">
            <input
              type="checkbox"
              name="is_published"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Published
          </label>
          <label className="flex items-center gap-3 text-stone-700">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured || false}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />
            Featured on the website
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            disabled={loading}
          >
            {editingId ? 'Update post' : 'Create post'}
          </button>
          {editingId && (
            <button
              type="button"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {loading && <div className="text-sm text-stone-500">Loading posts...</div>}
        {posts.map((post) => (
          <div key={post.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                  {new Date(post.publish_date).toLocaleString()}
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900">{post.title}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(post)} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                  Edit
                </button>
                <button onClick={() => handleDelete(post.id)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
                  Delete
                </button>
              </div>
            </div>

            {post.image_url && (
              <div className="px-6">
                <img src={resolveMediaUrl(post.image_url)} alt={post.title} className="h-56 w-full rounded-[1.5rem] object-cover" />
              </div>
            )}

            <div className="px-6 py-5">
              <div className="rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-7 text-stone-700">{post.content}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${post.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
                {post.is_featured && (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
