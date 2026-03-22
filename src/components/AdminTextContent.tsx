import React, { useEffect, useMemo, useState } from 'react';
import { Locale, textContentAPI, TextContent, TextContentRequest } from '../services/api';

const emptyForm: TextContentRequest = {
  key: '',
  value: '',
  group: '',
  locale: 'da',
};

const locales: Locale[] = ['da', 'en', 'de'];
const defaultGroups = ['Home', 'Navigation', 'About', 'Flavours', 'Prices', 'Services', 'Contact', 'OpeningHours', 'News'];

export default function AdminTextContent() {
  const [contents, setContents] = useState<TextContent[]>([]);
  const [form, setForm] = useState<TextContentRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const data = await textContentAPI.getAll();
      setContents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await textContentAPI.update(editingId, form);
      } else {
        await textContentAPI.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchContents();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const grouped = useMemo(() => {
    const result: Record<string, TextContent[]> = {};
    for (const content of contents) {
      if (!result[content.group]) {
        result[content.group] = [];
      }
      result[content.group].push(content);
    }
    return result;
  }, [contents]);

  const groups = useMemo(() => {
    const dynamicGroups = contents.map((content) => content.group);
    return Array.from(new Set([...defaultGroups, ...dynamicGroups])).sort();
  }, [contents]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Translations</h2>
        <p className="mt-2 text-sm text-stone-500">Edit the locale-specific text keys used throughout the public website.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <input
            name="key"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            placeholder="Key"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <select
            name="group"
            value={form.group}
            onChange={(e) => setForm({ ...form, group: e.target.value })}
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          >
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <select
            name="locale"
            value={form.locale}
            onChange={(e) => setForm({ ...form, locale: e.target.value as Locale })}
            className="rounded-2xl border border-stone-200 px-4 py-3"
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            {editingId ? 'Update' : 'Create'}
          </button>
        </div>
        <textarea
          name="value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          placeholder="Text value"
          rows={4}
          className="mt-4 w-full rounded-[1.5rem] border border-stone-200 px-4 py-3"
          required
        />
      </form>

      {loading && <div className="text-sm text-stone-500">Loading text content...</div>}

      <div className="space-y-5">
        {Object.entries(grouped).map(([group, groupItems]) => (
          <div key={group} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-stone-900">{group}</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {groupItems.map((content) => (
                <div key={content.id} className="rounded-[1.5rem] border border-stone-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                        {content.locale.toUpperCase()}
                      </div>
                      <div className="mt-1 font-medium text-stone-900">{content.base_key}</div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => {
                          setEditingId(content.id);
                          setForm({
                            key: content.base_key,
                            group: content.group,
                            locale: content.locale,
                            value: content.value,
                          });
                        }}
                        className="text-stone-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Delete this translation?')) return;
                          await textContentAPI.delete(content.id);
                          fetchContents();
                        }}
                        className="text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm leading-7 text-stone-600">{content.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
