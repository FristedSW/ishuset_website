import React, { useEffect, useState } from 'react';
import { freezerBookingAPI, FreezerBooking } from '../services/api';
import FreezerCalendarGrid from './FreezerCalendarGrid';

export default function AdminFreezerCalendar() {
  const [bookings, setBookings] = useState<FreezerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    freezerBookingAPI
      .getAll()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Freezer calendar</h2>
        <p className="mt-2 text-sm text-stone-500">
          Accepted freezer rentals are shown in a monthly calendar so you can check availability before confirming requests.
        </p>
      </div>

      {error && <div className="rounded-[1.5rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-stone-500">Loading freezer calendar...</div>}
      {!loading && <FreezerCalendarGrid bookings={bookings} />}
    </div>
  );
}
