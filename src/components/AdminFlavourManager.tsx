import React, { useEffect, useState } from 'react';
import { flavourAPI, Flavour, FlavourRequest } from '../services/api';

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
  const [form, setForm] = useState<FlavourRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlavours = async () => {
    setLoading(true);
    try {
      const data = await flavourAPI.getAll(true);
      setFlavours(data);
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

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input name="name_da" value={form.name_da} onChange={handleChange} placeholder="Name (DA)" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input name="name_en" value={form.name_en} onChange={handleChange} placeholder="Name (EN)" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input name="name_de" value={form.name_de} onChange={handleChange} placeholder="Name (DE)" className="rounded-2xl border border-stone-200 px-4 py-3" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <textarea name="description_da" value={form.description_da} onChange={handleChange} placeholder="Description (DA)" className="min-h-28 rounded-[1.5rem] border border-stone-200 px-4 py-3" required />
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

      <div className="grid gap-4 md:grid-cols-2">
        {loading && <div className="text-sm text-stone-500">Loading flavours...</div>}
        {!loading &&
          flavours.map((flavour) => (
            <div key={flavour.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{flavour.slug}</div>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-900">{flavour.name_da}</h3>
                  <p className="mt-2 text-sm text-stone-600">{flavour.description_da}</p>
                </div>
                <div className="text-right text-xs text-stone-400">
                  <div>{flavour.category}</div>
                  <div>#{flavour.sort_order}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
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
