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
  const todayJs = new Date().getDay();
  const todayIndex = todayJs === 0 ? 6 : todayJs - 1;

  const fetchHours = async () => {
    setLoading(true);
    try {
      const data = await openingHoursAPI.getAll();
      setHours(data);
      setDrafts(Object.fromEntries(data.map((day) => [day.id, toRequest(day)])));
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

  const orderedHours = useMemo(() => {
    return [...hours].sort((a, b) => {
      const aIndex = days.findIndex((day) => day.key === a.day);
      const bIndex = days.findIndex((day) => day.key === b.day);
      const aOffset = (aIndex - todayIndex + 7) % 7;
      const bOffset = (bIndex - todayIndex + 7) % 7;
      return aOffset - bOffset;
    });
  }, [hours, todayIndex]);

  const handleChange = (id: number, field: keyof OpeningHoursRequest, value: string | boolean) => {
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
    return <div className="text-sm text-stone-500">Loading opening hours...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Opening hours</h2>
        <p className="mt-2 text-sm text-stone-500">Adjust each weekday and save rows only when you are ready.</p>
      </div>

      {error && <div className="rounded-[1.5rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}

      <div className="space-y-4">
        {orderedHours.map((day) => {
          const draft = drafts[day.id];
          if (!draft) return null;

          return (
            <div key={day.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-400">Weekday</div>
                  <h3 className="mt-1 text-2xl font-semibold text-stone-900">
                    {days.find((d) => d.key === day.day)?.label || day.day}
                  </h3>
                </div>
                {dirtyRows.has(day.id) && (
                  <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Not saved
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Open time</span>
                  <input
                    type="time"
                    value={draft.open_time}
                    onChange={(e) => handleChange(day.id, 'open_time', e.target.value)}
                    disabled={!draft.is_open || !!draft.is_unknown}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 disabled:bg-stone-100"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Close time</span>
                  <input
                    type="time"
                    value={draft.close_time}
                    onChange={(e) => handleChange(day.id, 'close_time', e.target.value)}
                    disabled={!draft.is_open || !!draft.is_unknown}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 disabled:bg-stone-100"
                  />
                </label>
                <label className="flex items-center gap-3 rounded-[1.5rem] bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input type="checkbox" checked={draft.is_open} onChange={(e) => handleChange(day.id, 'is_open', e.target.checked)} />
                  Open this day
                </label>
                <label className="flex items-center gap-3 rounded-[1.5rem] bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input type="checkbox" checked={!!draft.is_unknown} onChange={(e) => handleChange(day.id, 'is_unknown', e.target.checked)} />
                  Unknown for now
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr]">
                <label className="flex items-center gap-3 rounded-[1.5rem] bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={draft.is_estimated !== false}
                    onChange={(e) => handleChange(day.id, 'is_estimated', e.target.checked)}
                  />
                  Mark as estimated
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Special message</span>
                  <input
                    type="text"
                    value={draft.special_message || ''}
                    onChange={(e) => handleChange(day.id, 'special_message', e.target.value)}
                    placeholder="For example: only takeaway"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleSave(day.id)}
                  disabled={!dirtyRows.has(day.id) || saving === day.id}
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving === day.id ? 'Saving' : 'Save'}
                </button>
                <button
                  onClick={() => handleReset(day.id)}
                  disabled={!dirtyRows.has(day.id) || saving === day.id}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
