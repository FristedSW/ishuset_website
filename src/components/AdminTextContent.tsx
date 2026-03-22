import React, { useEffect, useState } from 'react';
import { textContentAPI, TextContent, TextContentRequest } from '../services/api';

const emptyForm: TextContentRequest = {
  key: '',
  value: '',
  group: '',
};

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: TextContent) => {
    setForm({
      key: content.key,
      value: content.value,
      group: content.group,
    });
    setEditingId(content.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Slet dette indhold?')) return;
    setLoading(true);
    setError(null);
    try {
      await textContentAPI.delete(id);
      fetchContents();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const groups = Array.from(new Set(contents.map(c => c.group))).sort();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Tekst Indhold</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            name="key"
            value={form.key}
            onChange={handleChange}
            placeholder="Nøgle (f.eks. hero_title)"
            className="border p-2 rounded"
            required
          />
          <input
            name="group"
            value={form.group}
            onChange={handleChange}
            placeholder="Gruppe (f.eks. Home, About)"
            className="border p-2 rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? 'Opdater' : 'Opret'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuller
              </button>
            )}
          </div>
        </div>
        <textarea
          name="value"
          value={form.value}
          onChange={handleChange}
          placeholder="Indhold"
          className="w-full border p-2 rounded"
          rows={3}
          required
        />
      </form>

      {loading && <div>Indlæser...</div>}
      
      {!loading && contents.length === 0 && (
        <div className="text-gray-500">Intet indhold endnu.</div>
      )}

      <div className="space-y-6">
        {groups.map(group => (
          <div key={group} className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-semibold mb-3">{group}</h3>
            <div className="space-y-3">
              {contents
                .filter(content => content.group === group)
                .map(content => (
                  <div key={content.id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-600">{content.key}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(content)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Rediger
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Slet
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-800">{content.value}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 