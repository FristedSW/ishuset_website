import React, { useEffect, useState } from 'react';
import { mediaAssetAPI, MediaAsset, MediaAssetRequest } from '../services/api';

const emptyForm: MediaAssetRequest = {
  title: '',
  description: '',
  alt_text: '',
  file_url: '',
  asset_type: 'image',
  source: 'local',
};

export default function AdminMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<MediaAssetRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadAssets = async () => {
    try {
      const data = await mediaAssetAPI.getAll();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setAssets([]);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedFile(null);
  };

  const handleUploadLocal = async () => {
    if (!selectedFile) {
      throw new Error('Choose a file before uploading.');
    }
    const data = await mediaAssetAPI.upload(selectedFile);
    return data.file_url;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let fileUrl = form.file_url.trim();
      if (selectedFile) {
        setIsUploading(true);
        fileUrl = await handleUploadLocal();
      }

      const payload: MediaAssetRequest = {
        ...form,
        file_url: fileUrl,
        source: selectedFile ? 'local' : form.source || 'manual',
      };

      if (!payload.file_url) {
        throw new Error('Add a file URL or upload an image first.');
      }

      if (editingId) {
        await mediaAssetAPI.update(editingId, payload);
        setSuccess('Media item updated.');
      } else {
        await mediaAssetAPI.create(payload);
        setSuccess('Media item saved to the library.');
      }

      resetForm();
      await loadAssets();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (asset: MediaAsset) => {
    setEditingId(asset.id);
    setSelectedFile(null);
    setForm({
      title: asset.title,
      description: asset.description || '',
      alt_text: asset.alt_text || '',
      file_url: asset.file_url,
      asset_type: asset.asset_type || 'image',
      source: asset.source || 'local',
    });
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this media item from the library?')) return;
    setError(null);
    setSuccess(null);
    try {
      await mediaAssetAPI.delete(id);
      await loadAssets();
      if (editingId === id) {
        resetForm();
      }
      setSuccess('Media item deleted.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl((current) => (current === url ? null : current)), 2000);
    } catch {
      setError('Could not copy the URL.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Media library</h2>
        <p className="mt-2 text-sm text-stone-500">
          Upload images locally, save their metadata here, and reuse the URL across the site.
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

        <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <input
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value, source: 'manual' })}
            placeholder="Existing image URL"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
          <select
            value={form.asset_type}
            onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
            className="rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-stone-700">Upload to local media library</div>
              <div className="text-sm text-stone-500">
                Choose a file here and the saved library item will automatically use the local backend URL.
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-sm text-stone-600"
            />
          </div>
          {selectedFile && <div className="mt-3 text-sm text-stone-600">Selected file: {selectedFile.name}</div>}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
          >
            {isUploading ? 'Uploading...' : editingId ? 'Update media' : 'Save media'}
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
        {assets.map((asset) => (
          <div key={asset.id} className="rounded-[2rem] bg-white p-5 shadow-sm">
            <div className="overflow-hidden rounded-[1.5rem] bg-stone-100">
              <img src={asset.file_url} alt={asset.alt_text || asset.title} className="h-56 w-full object-cover" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-stone-900">{asset.title}</h3>
                {asset.description && <p className="mt-2 text-sm text-stone-500">{asset.description}</p>}
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-400">{asset.source}</div>
              </div>
            </div>
            <div className="mt-4 rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm text-stone-600 break-all">
              {asset.file_url}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleCopy(asset.file_url)}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
              >
                {copiedUrl === asset.file_url ? 'Copied' : 'Copy URL'}
              </button>
              <button
                onClick={() => handleEdit(asset)}
                className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(asset.id)}
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
