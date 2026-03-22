import React, { useEffect, useMemo, useState } from 'react';
import { priceAPI, PriceItem, PriceItemRequest } from '../services/api';

const emptyForm: PriceItemRequest = {
  key: '',
  label_da: '',
  label_en: '',
  label_de: '',
  description: '',
  price: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminPriceManager() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [draftVisibility, setDraftVisibility] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<PriceItemRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingRow, setSavingRow] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      const data = await priceAPI.getAll(true);
      const safeData = Array.isArray(data) ? data : [];
      setItems(safeData);
      setDraftVisibility(Object.fromEntries(safeData.map((item) => [item.id, item.is_active])));
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await priceAPI.update(editingId, form);
      } else {
        await priceAPI.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchItems();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const dirtyRows = useMemo(() => {
    const dirty = new Set<number>();
    items.forEach((item) => {
      if (draftVisibility[item.id] !== item.is_active) {
        dirty.add(item.id);
      }
    });
    return dirty;
  }, [draftVisibility, items]);

  const handleSaveVisibility = async (item: PriceItem) => {
    setSavingRow(item.id);
    setError(null);
    try {
      await priceAPI.update(item.id, {
        key: item.key,
        label_da: item.label_da,
        label_en: item.label_en || '',
        label_de: item.label_de || '',
        description: item.description || '',
        price: item.price,
        sort_order: item.sort_order,
        is_active: !!draftVisibility[item.id],
      });
      fetchItems();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingRow(null);
    }
  };

  const handleResetVisibility = (item: PriceItem) => {
    setDraftVisibility((current) => ({
      ...current,
      [item.id]: item.is_active,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Prices</h2>
        <p className="mt-2 text-sm text-stone-500">Edit the scoop prices shown in the public menu overlay.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="key" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="price" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="sort order" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <label className="flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-600">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Visible
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input value={form.label_da} onChange={(e) => setForm({ ...form, label_da: e.target.value })} placeholder="Label (DA)" className="rounded-2xl border border-stone-200 px-4 py-3" required />
          <input value={form.label_en} onChange={(e) => setForm({ ...form, label_en: e.target.value })} placeholder="Label (EN)" className="rounded-2xl border border-stone-200 px-4 py-3" />
          <input value={form.label_de} onChange={(e) => setForm({ ...form, label_de: e.target.value })} placeholder="Label (DE)" className="rounded-2xl border border-stone-200 px-4 py-3" />
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="mt-4 w-full rounded-[1.5rem] border border-stone-200 px-4 py-3" />
        <div className="mt-4 flex gap-3">
          <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            {editingId ? 'Update price' : 'Create price'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="grid grid-cols-[auto_1.5fr_auto_auto_auto] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          <div>Show</div>
          <div>Price</div>
          <div>Amount</div>
          <div>Order</div>
          <div></div>
        </div>
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1.5fr_auto_auto_auto] items-center gap-4 border-b border-stone-100 px-6 py-4 last:border-b-0">
            <div>
              <input
                type="checkbox"
                checked={!!draftVisibility[item.id]}
                onChange={(e) =>
                  setDraftVisibility((current) => ({
                    ...current,
                    [item.id]: e.target.checked,
                  }))
                }
              />
            </div>
            <div>
              <div className="font-semibold text-stone-900">{item.label_da}</div>
              <div className="text-sm text-stone-500">{item.key}</div>
            </div>
            <div className="text-sm text-stone-700">{item.price}</div>
            <div className="text-sm text-stone-500">#{item.sort_order}</div>
            <div className="flex gap-2">
              {dirtyRows.has(item.id) && (
                <>
                  <button
                    onClick={() => handleSaveVisibility(item)}
                    disabled={savingRow === item.id}
                    className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {savingRow === item.id ? 'Saving' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleResetVisibility(item)}
                    disabled={savingRow === item.id}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    key: item.key,
                    label_da: item.label_da,
                    label_en: item.label_en || '',
                    label_de: item.label_de || '',
                    description: item.description || '',
                    price: item.price,
                    sort_order: item.sort_order,
                    is_active: !!draftVisibility[item.id],
                  });
                }}
                className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm('Delete this price item?')) return;
                  await priceAPI.delete(item.id);
                  fetchItems();
                }}
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
