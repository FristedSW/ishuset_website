import React, { useEffect, useMemo, useState } from 'react';
import { openingHoursAPI, OpeningHours, OpeningHoursRequest } from '../services/api';

const days = [
  { key: 'monday', label: 'Mandag' },
  { key: 'tuesday', label: 'Tirsdag' },
  { key: 'wednesday', label: 'Onsdag' },
  { key: 'thursday', label: 'Torsdag' },
  { key: 'friday', label: 'Fredag' },
  { key: 'saturday', label: 'Lørdag' },
  { key: 'sunday', label: 'Søndag' },
];

function toRequest(day: OpeningHours): OpeningHoursRequest {
  return {
    day: day.day,
    open_time: day.open_time,
    close_time: day.close_time,
    is_open: day.is_open,
    is_unknown: day.is_unknown,
    is_estimated: day.is_estimated,
    special_message: day.special_message,
  };
}

export default function AdminOpeningHours() {
  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [drafts, setDrafts] = useState<Record<number, OpeningHoursRequest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchHours = async () => {
    setLoading(true);
    try {
      const data = await openingHoursAPI.getAll();
      setHours(data);
      setDrafts(
        Object.fromEntries(
          data.map((day) => [day.id, toRequest(day)])
        )
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const dirtyRows = useMemo(() => {
    const dirty = new Set<number>();
    for (const day of hours) {
      const draft = drafts[day.id];
      if (!draft) continue;
      const original = toRequest(day);
      if (JSON.stringify(draft) !== JSON.stringify(original)) {
        dirty.add(day.id);
      }
    }
    return dirty;
  }, [drafts, hours]);

  const handleChange = (id: number, field: keyof OpeningHoursRequest, value: any) => {
    setDrafts((current) => {
      const existing = current[id];
      if (!existing) return current;
      return {
        ...current,
        [id]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async (id: number) => {
    const draft = drafts[id];
    if (!draft) return;

    setSaving(id);
    setError(null);
    try {
      const updated = await openingHoursAPI.update(id, draft);
      setHours((current) => current.map((day) => (day.id === id ? updated : day)));
      setDrafts((current) => ({
        ...current,
        [id]: toRequest(updated),
      }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleReset = (id: number) => {
    const original = hours.find((day) => day.id === id);
    if (!original) return;
    setDrafts((current) => ({
      ...current,
      [id]: toRequest(original),
    }));
  };

  if (loading) {
    return <div>Indlæser...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Åbningstider</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åben</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åbningstid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lukketid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukendt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimeret</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Særlig besked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handling</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hours.map((day) => {
              const draft = drafts[day.id];
              if (!draft) return null;

              return (
                <tr key={day.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {days.find((d) => d.key === day.day)?.label || day.day}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={draft.is_open}
                      onChange={(e) => handleChange(day.id, 'is_open', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="time"
                      value={draft.open_time}
                      onChange={(e) => handleChange(day.id, 'open_time', e.target.value)}
                      disabled={!draft.is_open || draft.is_unknown}
                      className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="time"
                      value={draft.close_time}
                      onChange={(e) => handleChange(day.id, 'close_time', e.target.value)}
                      disabled={!draft.is_open || draft.is_unknown}
                      className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!draft.is_unknown}
                      onChange={(e) => handleChange(day.id, 'is_unknown', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={draft.is_estimated !== false}
                      onChange={(e) => handleChange(day.id, 'is_estimated', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={draft.special_message || ''}
                      onChange={(e) => handleChange(day.id, 'special_message', e.target.value)}
                      placeholder="F.eks. 'Kun takeaway'"
                      className="border rounded px-2 py-1 text-sm w-full"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(day.id)}
                        disabled={!dirtyRows.has(day.id) || saving === day.id}
                        className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {saving === day.id ? 'Gemmer' : 'Gem'}
                      </button>
                      <button
                        onClick={() => handleReset(day.id)}
                        disabled={!dirtyRows.has(day.id) || saving === day.id}
                        className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Nulstil
                      </button>
                    </div>
                    {dirtyRows.has(day.id) && (
                      <div className="mt-2 text-xs text-amber-600">Ikke gemt</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {saving !== null && (
        <div className="mt-4 text-sm text-gray-600">Gemmer ændringer...</div>
      )}
    </div>
  );
}
