import React, { useEffect, useState } from 'react';
import {
  galleryAPI,
  GalleryItem,
  GalleryItemRequest,
  MediaAsset,
  mediaAssetAPI,
  resolveMediaUrl,
} from '../services/api';

const emptyForm: GalleryItemRequest = {
  title: '',
  description: '',
  alt_text: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminGalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<GalleryItemRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [galleryItems, mediaAssets] = await Promise.all([
        galleryAPI.getAll(true),
        mediaAssetAPI.getAll(),
      ]);
      setItems(Array.isArray(galleryItems) ? galleryItems : []);
      setAssets(Array.isArray(mediaAssets) ? mediaAssets : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await galleryAPI.update(editingId, form);
        setSuccess('Gallery item updated.');
      } else {
        await galleryAPI.create(form);
        setSuccess('Gallery item created.');
      }
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this gallery item?')) return;
    setError(null);
    setSuccess(null);
    try {
      await galleryAPI.delete(id);
      await loadData();
      setSuccess('Gallery item deleted.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Gallery</h2>
        <p className="mt-2 text-sm text-stone-500">
          Choose which images appear in the public gallery and in which order.
        </p>
      </div>

      {error && <div className="rounded-[1.5rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {success && <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            value={form.alt_text}
            onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
            placeholder="Alt text"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="mt-4 w-full rounded-[1.5rem] border border-stone-200 px-4 py-3"
        />

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.35fr_0.35fr]">
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="Image URL"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            placeholder="Sort"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
          <label className="flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Visible
          </label>
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4">
          <label className="block text-sm font-medium text-stone-700">Use an image from the media library</label>
          <select
            value=""
            onChange={(e) => {
              const asset = assets.find((entry) => entry.id === Number(e.target.value));
              if (!asset) return;
              setForm((current) => ({
                ...current,
                image_url: asset.file_url,
                alt_text: current.alt_text || asset.alt_text || '',
                title: current.title || asset.title,
                description: current.description || asset.description || '',
              }));
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

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            {editingId ? 'Update gallery item' : 'Create gallery item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="overflow-hidden rounded-[1.5rem] bg-stone-100">
              <img src={resolveMediaUrl(item.image_url)} alt={item.alt_text || item.title} className="h-56 w-full object-cover" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-stone-400">#{item.sort_order}</div>
                <h3 className="mt-2 text-xl font-semibold text-stone-900">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm text-stone-500">{item.description}</p>}
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                {item.is_active ? 'Visible' : 'Hidden'}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    title: item.title,
                    description: item.description || '',
                    alt_text: item.alt_text || '',
                    image_url: item.image_url,
                    sort_order: item.sort_order,
                    is_active: item.is_active,
                  });
                  setSuccess(null);
                  setError(null);
                }}
                className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
