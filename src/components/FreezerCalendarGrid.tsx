import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FreezerBooking } from '../services/api';

interface FreezerCalendarGridProps {
  bookings: FreezerBooking[];
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

function startColumnIndex(date: Date) {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function FreezerCalendarGrid({ bookings }: FreezerCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1));
  }, [currentMonth]);

  const leadingEmptyCells = useMemo(() => Array.from({ length: startColumnIndex(monthDays[0]) }), [monthDays]);

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter((booking) => bookingCoversDate(booking, selectedDate));
  }, [selectedDate, bookings]);

  const getBookingPillClasses = (size: 'small' | 'large') =>
    size === 'small' ? 'bg-sky-100 text-sky-900' : 'bg-rose-100 text-rose-900';

  const getBookingBadgeClasses = (size: 'small' | 'large') =>
    size === 'small' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800';

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-stone-900">Freezer calendar</h3>
          <div className="mt-1 text-sm text-stone-500">
            See both freezer sizes in one overview, then click a day to inspect the bookings.
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            Small freezer
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            Large freezer
          </div>
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
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {leadingEmptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="min-h-[7rem] rounded-[1.25rem] border border-transparent bg-transparent" />
        ))}

        {monthDays.map((day) => {
          const todaysBookings = bookings.filter((booking) => bookingCoversDate(booking, day));
          const isToday = sameDay(day, new Date());
          const isSelected = selectedDate ? sameDay(day, selectedDate) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`min-h-[7rem] rounded-[1.25rem] border p-2 text-left transition ${
                isSelected
                  ? 'border-sky-400 bg-sky-50 shadow-sm'
                  : 'border-stone-200 bg-stone-50 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`text-sm font-semibold ${isToday ? 'text-sky-600' : 'text-stone-700'}`}>
                  {day.getDate()}
                </div>
                {todaysBookings.length > 0 && (
                  <div className="rounded-full bg-stone-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-700">
                    {todaysBookings.length} booked
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {todaysBookings.slice(0, 2).map((booking) => (
                  <div
                    key={`${booking.id}-${day.toISOString()}`}
                    className={`rounded-xl px-2 py-1 text-[11px] font-medium ${getBookingPillClasses(booking.freezer_size)}`}
                  >
                    {booking.customer_name}
                  </div>
                ))}
                {todaysBookings.length > 2 && (
                  <div className="text-[11px] font-medium text-stone-500">+{todaysBookings.length - 2} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-stone-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-stone-400">Selected day</div>
            <div className="mt-1 text-lg font-semibold text-stone-900">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : 'No date selected'}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedDayBookings.length === 0 && (
            <div className="text-sm text-stone-500">No freezer bookings on the selected day.</div>
          )}
          {selectedDayBookings.map((booking) => (
            <div key={booking.id} className="rounded-[1.25rem] bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium text-stone-900">{booking.customer_name}</div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getBookingBadgeClasses(booking.freezer_size)}`}>
                  {booking.freezer_size} freezer
                </div>
              </div>
              <div className="mt-1 text-sm text-stone-500">
                {new Date(booking.start_date).toLocaleDateString('en-GB')} - {new Date(booking.end_date).toLocaleDateString('en-GB')}
              </div>
              {booking.occasion && <div className="mt-1 text-sm text-stone-500">{booking.occasion}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
