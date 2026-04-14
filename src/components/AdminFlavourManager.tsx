import React, { useEffect, useMemo, useState } from 'react';
import { flavourAPI, Flavour, FlavourRequest, MediaAsset, mediaAssetAPI, resolveMediaUrl } from '../services/api';

const emptyForm: FlavourRequest = {
  slug: '',
  name_da: '',
  name_en: '',
  name_de: '',
  description_da: '',
  description_en: '',
  description_de: '',
  category: 'milk-based',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminFlavourManager() {
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [draftVisibility, setDraftVisibility] = useState<Record<number, boolean>>({});
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<FlavourRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchFlavours = async () => {
    setLoading(true);
    try {
      const [flavourData, assetData] = await Promise.all([flavourAPI.getAll(true), mediaAssetAPI.getAll()]);
      setFlavours(Array.isArray(flavourData) ? flavourData : []);
      setDraftVisibility(
        Object.fromEntries((Array.isArray(flavourData) ? flavourData : []).map((item) => [item.id, item.is_active]))
      );
      setAssets(Array.isArray(assetData) ? assetData : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlavours();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = 'checked' in event.target ? event.target.checked : false;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'sort_order' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await flavourAPI.update(editingId, form);
      } else {
        await flavourAPI.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchFlavours();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEdit = (flavour: Flavour) => {
    setForm({
      slug: flavour.slug,
      name_da: flavour.name_da,
      name_en: flavour.name_en || '',
      name_de: flavour.name_de || '',
      description_da: flavour.description_da,
      description_en: flavour.description_en || '',
      description_de: flavour.description_de || '',
      category: flavour.category,
      image_url: flavour.image_url || '',
      sort_order: flavour.sort_order,
      is_active: flavour.is_active,
    });
    setEditingId(flavour.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this flavour?')) return;
    try {
      await flavourAPI.delete(id);
      fetchFlavours();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const dirtyRows = useMemo(() => {
    const dirty = new Set<number>();
    flavours.forEach((flavour) => {
      if (draftVisibility[flavour.id] !== flavour.is_active) {
        dirty.add(flavour.id);
      }
    });
    return dirty;
  }, [draftVisibility, flavours]);

  const handleToggleVisibility = (id: number, checked: boolean) => {
    setDraftVisibility((current) => ({
      ...current,
      [id]: checked,
    }));
  };

  const handleSaveVisibility = async (flavour: Flavour) => {
    setError(null);
    setSavingRow(flavour.id);
    try {
      await flavourAPI.update(flavour.id, {
        slug: flavour.slug,
        name_da: flavour.name_da,
        name_en: flavour.name_en || '',
        name_de: flavour.name_de || '',
        description_da: flavour.description_da,
        description_en: flavour.description_en || '',
        description_de: flavour.description_de || '',
        category: flavour.category,
        image_url: flavour.image_url || '',
        sort_order: flavour.sort_order,
        is_active: !!draftVisibility[flavour.id],
      });
      fetchFlavours();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingRow(null);
    }
  };

  const handleResetVisibility = (flavour: Flavour) => {
    setDraftVisibility((current) => ({
      ...current,
      [flavour.id]: flavour.is_active,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Flavour manager</h2>
        <p className="mt-2 text-sm text-stone-500">Create, translate, sort, hide, and remove flavours shown on the public site.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input name="slug" value={form.slug} onChange={handleChange} placeholder="slug" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="image url" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} placeholder="sort order" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <select name="category" value={form.category} onChange={handleChange} className="rounded-2xl border border-stone-200 px-4 py-3">
            <option value="milk-based">milk-based</option>
            <option value="sorbet">sorbet</option>
          </select>
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4">
          <label className="block text-sm font-medium text-stone-700">Use an image from the media library</label>
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
          <label className="mt-4 block text-sm font-medium text-stone-700">Or upload a new image directly</label>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingImage(true);
              setError(null);
              try {
                const upload = await mediaAssetAPI.upload(file);
                const createdAsset = await mediaAssetAPI.create({
                  title: file.name.replace(/\.[^.]+$/, ''),
                  description: '',
                  alt_text: '',
                  file_url: upload.file_url,
                  asset_type: 'image',
                  source: 'local',
                });
                setAssets((current) => [createdAsset, ...current]);
                setForm((current) => ({ ...current, image_url: createdAsset.file_url }));
              } catch (e: any) {
                setError(e.message);
              } finally {
                setUploadingImage(false);
                e.target.value = '';
              }
            }}
          />
          {uploadingImage && <div className="mt-2 text-sm text-stone-500">Uploading image...</div>}
        </div>

        {form.image_url && (
          <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-stone-100">
            <img src={resolveMediaUrl(form.image_url)} alt="Flavour preview" className="h-52 w-full object-cover" />
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input name="name_da" value={form.name_da} onChange={handleChange} placeholder="Name (DA)" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="name_en" value={form.name_en} onChange={handleChange} placeholder="Name (EN)" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="name_de" value={form.name_de} onChange={handleChange} placeholder="Name (DE)" className="rounded-2xl border border-stone-200 px-4 py-3" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <textarea name="description_da" value={form.description_da} onChange={handleChange} placeholder="Description (DA)" className="min-h-28 rounded-[1.5rem] border border-stone-200 px-4 py-3" />
          <textarea name="description_en" value={form.description_en} onChange={handleChange} placeholder="Description (EN)" className="min-h-28 rounded-[1.5rem] border border-stone-200 px-4 py-3" />
          <textarea name="description_de" value={form.description_de} onChange={handleChange} placeholder="Description (DE)" className="min-h-28 rounded-[1.5rem] border border-stone-200 px-4 py-3" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="text-sm text-stone-500">Prices are managed separately in the Prices tab.</div>
          <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            Visible
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            {editingId ? 'Update flavour' : 'Create flavour'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid grid-cols-[auto_1.4fr_0.8fr_auto_auto] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          <div>Show</div>
          <div>Flavour</div>
          <div>Category</div>
          <div>Order</div>
          <div></div>
        </div>
        {loading && <div className="px-6 py-5 text-sm text-stone-500">Loading flavours...</div>}
        {!loading &&
          flavours.map((flavour) => (
            <div key={flavour.id} className="grid grid-cols-[auto_1.4fr_0.8fr_auto_auto] items-center gap-4 border-b border-stone-100 px-6 py-4 last:border-b-0">
              <div>
                <input
                  type="checkbox"
                  checked={!!draftVisibility[flavour.id]}
                  onChange={(e) => handleToggleVisibility(flavour.id, e.target.checked)}
                />
              </div>
              <div className="flex items-center gap-4">
                {flavour.image_url ? (
                  <img src={resolveMediaUrl(flavour.image_url)} alt={flavour.name_da} className="h-14 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${flavour.category === 'sorbet' ? 'from-sky-100 to-emerald-100' : 'from-amber-100 to-rose-100'}`} />
                )}
                <div>
                  <div className="font-semibold text-stone-900">{flavour.name_da}</div>
                  <div className="text-sm text-stone-500">{flavour.slug}</div>
                </div>
              </div>
              <div className="text-sm text-stone-600">{flavour.category}</div>
              <div className="text-sm text-stone-600">#{flavour.sort_order}</div>
              <div className="flex gap-2">
                {dirtyRows.has(flavour.id) && (
                  <>
                    <button
                      onClick={() => handleSaveVisibility(flavour)}
                      disabled={savingRow === flavour.id}
                      className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {savingRow === flavour.id ? 'Saving' : 'Save'}
                    </button>
                    <button
                      onClick={() => handleResetVisibility(flavour)}
                      disabled={savingRow === flavour.id}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={() => handleEdit(flavour)} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                  Edit
                </button>
                <button onClick={() => handleDelete(flavour.id)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
