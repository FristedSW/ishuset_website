import React, { useEffect, useState } from 'react';
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

export default function AdminOpeningHours() {
  const [hours, setHours] = useState<OpeningHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchHours = async () => {
    setLoading(true);
    try {
      const data = await openingHoursAPI.getAll();
      setHours(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const handleUpdate = async (id: number, updatedHours: OpeningHoursRequest) => {
    setSaving(id);
    try {
      await openingHoursAPI.update(id, updatedHours);
      fetchHours();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (id: number, field: keyof OpeningHoursRequest, value: any) => {
    const day = hours.find(h => h.id === id);
    if (!day) return;

    const updatedHours: OpeningHoursRequest = {
      day: field === 'day' ? value : day.day,
      open_time: field === 'open_time' ? value : day.open_time,
      close_time: field === 'close_time' ? value : day.close_time,
      is_open: field === 'is_open' ? value : day.is_open,
      is_unknown: field === 'is_unknown' ? value : day.is_unknown,
      is_estimated: field === 'is_estimated' ? value : day.is_estimated,
      special_message: field === 'special_message' ? value : day.special_message,
    };

    handleUpdate(id, updatedHours);
  };

  if (loading) {
    return <div>Indlæser...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Åbningstider</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dag
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Åben
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Åbningstid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lukketid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukendt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimeret
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Særlig Besked
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hours.map((day) => (
              <tr key={day.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {days.find(d => d.key === day.day)?.label || day.day}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={day.is_open}
                    onChange={(e) => handleChange(day.id, 'is_open', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={day.open_time}
                    onChange={(e) => handleChange(day.id, 'open_time', e.target.value)}
                    disabled={!day.is_open || day.is_unknown}
                    className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={day.close_time}
                    onChange={(e) => handleChange(day.id, 'close_time', e.target.value)}
                    disabled={!day.is_open || day.is_unknown}
                    className="border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={!!day.is_unknown}
                    onChange={(e) => handleChange(day.id, 'is_unknown', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={day.is_estimated !== false}
                    onChange={(e) => handleChange(day.id, 'is_estimated', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={day.special_message || ''}
                    onChange={(e) => handleChange(day.id, 'special_message', e.target.value)}
                    placeholder="F.eks. 'Kun takeaway'"
                    className="border rounded px-2 py-1 text-sm w-full"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {saving !== null && (
        <div className="mt-4 text-sm text-gray-600">Gemmer ændringer...</div>
      )}
    </div>
  );
} 
