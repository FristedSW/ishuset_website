import React, { useEffect, useState } from 'react';
import { freezerBookingAPI, FreezerBooking, FreezerBookingCreateRequest } from '../services/api';
import FreezerCalendarGrid from './FreezerCalendarGrid';

const emptyForm: FreezerBookingCreateRequest = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  occasion: '',
  freezer_size: 'small',
  start_date: '',
  end_date: '',
  notes: '',
  price: '',
  payment_status: 'unpaid',
};

export default function AdminFreezerCalendar() {
  const [bookings, setBookings] = useState<FreezerBooking[]>([]);
  const [form, setForm] = useState<FreezerBookingCreateRequest>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingBookingId, setSavingBookingId] = useState<number | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await freezerBookingAPI.getAll();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Freezer calendar</h2>
        <p className="mt-2 text-sm text-stone-500">
          Accepted freezer rentals are shown in a monthly calendar, and you can also create a booking directly from admin.
        </p>
      </div>

      {error && <div className="rounded-[1.5rem] bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {success && <div className="rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError(null);
          setSuccess(null);
          try {
            await freezerBookingAPI.create(form);
            setForm(emptyForm);
            setSuccess('Manual freezer booking created.');
            await loadBookings();
          } catch (submitError: any) {
            setError(submitError.message);
          } finally {
            setSaving(false);
          }
        }}
        className="rounded-[2rem] bg-white p-6 shadow-sm"
      >
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-stone-900">Add manual booking</h3>
          <p className="mt-1 text-sm text-stone-500">Use this when you want to create a booking directly without a frontend request.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={form.customer_name}
            onChange={(e) => setForm((current) => ({ ...current, customer_name: e.target.value }))}
            placeholder="Customer name"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            type="email"
            value={form.customer_email}
            onChange={(e) => setForm((current) => ({ ...current, customer_email: e.target.value }))}
            placeholder="Customer email"
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            value={form.customer_phone || ''}
            onChange={(e) => setForm((current) => ({ ...current, customer_phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
          <select
            value={form.freezer_size}
            onChange={(e) => setForm((current) => ({ ...current, freezer_size: e.target.value as 'small' | 'large' }))}
            className="rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="small">Small freezer</option>
            <option value="large">Large freezer</option>
          </select>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            value={form.occasion || ''}
            onChange={(e) => setForm((current) => ({ ...current, occasion: e.target.value }))}
            placeholder="Occasion"
            className="rounded-2xl border border-stone-200 px-4 py-3"
          />
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm((current) => ({ ...current, start_date: e.target.value }))}
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm((current) => ({ ...current, end_date: e.target.value }))}
            className="rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
          <select
            value={form.payment_status}
            onChange={(e) => setForm((current) => ({ ...current, payment_status: e.target.value as 'paid' | 'unpaid' }))}
            className="rounded-2xl border border-stone-200 px-4 py-3"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <textarea
          value={form.notes || ''}
          onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
          placeholder="Notes"
          className="mt-4 min-h-28 w-full rounded-[1.5rem] border border-stone-200 px-4 py-3"
        />

        <input
          value={form.price || ''}
          onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
          placeholder="Price, for example 1200 kr"
          className="mt-4 w-full rounded-2xl border border-stone-200 px-4 py-3"
        />

        <div className="mt-6">
          <button type="submit" disabled={saving} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60">
            {saving ? 'Creating...' : 'Create booking'}
          </button>
        </div>
      </form>

      {loading && <div className="text-sm text-stone-500">Loading freezer calendar...</div>}
      {!loading && <FreezerCalendarGrid bookings={bookings} />}

      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-stone-900">Manage bookings</h3>
          <p className="mt-1 text-sm text-stone-500">Update payment state and notes for existing freezer bookings.</p>
        </div>

        {bookings.map((booking) => (
          <AdminBookingRow
            key={booking.id}
            booking={booking}
            saving={savingBookingId === booking.id}
            onSave={async (notes, price, paymentStatus) => {
              setSavingBookingId(booking.id);
              setError(null);
              setSuccess(null);
              try {
                await freezerBookingAPI.update(booking.id, {
                  notes,
                  price,
                  payment_status: paymentStatus,
                });
                setSuccess(`Updated booking for ${booking.customer_name}.`);
                await loadBookings();
              } catch (saveError: any) {
                setError(saveError.message);
              } finally {
                setSavingBookingId(null);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AdminBookingRow({
  booking,
  saving,
  onSave,
}: {
  booking: FreezerBooking;
  saving: boolean;
  onSave: (notes: string, price: string, paymentStatus: 'paid' | 'unpaid') => Promise<void>;
}) {
  const [notes, setNotes] = useState(booking.notes || '');
  const [price, setPrice] = useState(booking.price || '');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(booking.payment_status || 'unpaid');

  useEffect(() => {
    setNotes(booking.notes || '');
    setPrice(booking.price || '');
    setPaymentStatus(booking.payment_status || 'unpaid');
  }, [booking]);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{booking.freezer_size} freezer</div>
          <h4 className="mt-2 text-xl font-semibold text-stone-900">{booking.customer_name}</h4>
          <div className="mt-1 text-sm text-stone-500">{booking.customer_email}</div>
          <div className="mt-1 text-sm text-stone-500">
            {new Date(booking.start_date).toLocaleDateString('en-GB')} - {new Date(booking.end_date).toLocaleDateString('en-GB')}
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {paymentStatus}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[auto_auto_1fr]">
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
          className="rounded-2xl border border-stone-200 px-4 py-3"
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder="Price"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-24 rounded-[1.5rem] border border-stone-200 px-4 py-3"
          placeholder="Add internal notes"
        />
      </div>

      <div className="mt-4">
        <button
          onClick={() => onSave(notes, price, paymentStatus)}
          disabled={saving}
          className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save booking'}
        </button>
      </div>
    </div>
  );
}
