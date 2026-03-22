import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FreezerBooking } from '../services/api';

interface FreezerCalendarGridProps {
  bookings: FreezerBooking[];
}

const freezerTabs: Array<'small' | 'large'> = ['small', 'large'];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function bookingCoversDate(booking: FreezerBooking, date: Date) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const start = new Date(booking.start_date).setHours(0, 0, 0, 0);
  const end = new Date(booking.end_date).setHours(23, 59, 59, 999);
  return current >= start && current <= end;
}

export default function FreezerCalendarGrid({ bookings }: FreezerCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [activeSize, setActiveSize] = useState<'small' | 'large'>('small');

  const visibleBookings = useMemo(
    () => bookings.filter((booking) => booking.freezer_size === activeSize),
    [activeSize, bookings]
  );

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));
  }, [currentMonth]);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-stone-900">Freezer calendar</h3>
          <div className="mt-1 text-sm text-stone-500">Use the size tabs to check whether small or large freezer is available.</div>
        </div>
        <div className="flex gap-2">
          {freezerTabs.map((size) => (
            <button
              key={size}
              onClick={() => setActiveSize(size)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeSize === size ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-full bg-stone-100 p-2 text-stone-700">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold text-stone-900">
          {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-full bg-stone-100 p-2 text-stone-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const todaysBookings = visibleBookings.filter((booking) => bookingCoversDate(booking, day));
          return (
            <div
              key={day.toISOString()}
              className="min-h-[7rem] rounded-[1.25rem] border border-stone-200 bg-stone-50 p-2"
            >
              <div className={`text-sm font-semibold ${sameDay(day, new Date()) ? 'text-sky-600' : 'text-stone-700'}`}>
                {day.getDate()}
              </div>
              <div className="mt-2 space-y-1">
                {todaysBookings.map((booking) => (
                  <div key={`${booking.id}-${day.toISOString()}`} className="rounded-xl bg-sky-100 px-2 py-1 text-left text-[11px] font-medium text-sky-900">
                    {booking.customer_name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
