import React, { useEffect, useMemo, useState } from 'react';
import {
  contactAdminAPI,
  contactAPI,
  ContactMessage,
  freezerBookingAPI,
  FreezerBooking,
} from '../services/api';
import FreezerCalendarGrid from './FreezerCalendarGrid';

type RequestTab = 'pending' | 'approved' | 'deleted';

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '-';
}

function isFreezerRequest(message: ContactMessage) {
  return Boolean(message.preferred_from || message.preferred_to || message.preferred_date);
}

function hasRangeConflict(message: ContactMessage, bookings: FreezerBooking[], freezerSize: 'small' | 'large') {
  const startValue = message.preferred_from || message.preferred_date;
  const endValue = message.preferred_to || message.preferred_date || startValue;
  if (!startValue || !endValue) {
    return false;
  }

  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();
  return bookings
    .filter((booking) => booking.freezer_size === freezerSize)
    .some((booking) => {
      const bookingStart = new Date(booking.start_date).getTime();
      const bookingEnd = new Date(booking.end_date).getTime();
      return bookingStart <= end && bookingEnd >= start;
    });
}

export default function AdminContactCenter() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [bookings, setBookings] = useState<FreezerBooking[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, 'small' | 'large'>>({});
  const [activeTab, setActiveTab] = useState<RequestTab>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [messageData, bookingData] = await Promise.all([contactAPI.getAll(), freezerBookingAPI.getAll()]);
      const safeMessages = Array.isArray(messageData) ? messageData : [];
      setMessages(safeMessages);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
      setSelectedSizes((current) => {
        const next = { ...current };
        for (const message of safeMessages) {
          if (!next[message.id]) {
            next[message.id] = 'small';
          }
        }
        return next;
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMessages = useMemo(() => {
    switch (activeTab) {
      case 'approved':
        return messages.filter((message) => message.status === 'accepted');
      case 'deleted':
        return messages.filter((message) => message.status === 'deleted');
      default:
        return messages.filter((message) => message.status !== 'accepted' && message.status !== 'deleted');
    }
  }, [activeTab, messages]);

  const counts = useMemo(
    () => ({
      pending: messages.filter((message) => message.status !== 'accepted' && message.status !== 'deleted').length,
      approved: messages.filter((message) => message.status === 'accepted').length,
      deleted: messages.filter((message) => message.status === 'deleted').length,
    }),
    [messages]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Incoming requests</h2>
        <p className="mt-2 text-sm text-stone-500">
          Freezer requests can be accepted into either the small or large freezer calendar. Each freezer has its own availability.
        </p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {success && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
      {loading && <div className="text-sm text-stone-500">Loading requests...</div>}

      {!loading && <FreezerCalendarGrid bookings={bookings} />}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => setActiveTab('pending')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'pending' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}>
          Pending ({counts.pending})
        </button>
        <button onClick={() => setActiveTab('approved')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'approved' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}>
          Approved ({counts.approved})
        </button>
        <button onClick={() => setActiveTab('deleted')} className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'deleted' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}>
          Deleted ({counts.deleted})
        </button>
      </div>

      <div className="space-y-4">
        {filteredMessages.map((message) => {
          const freezerRequest = isFreezerRequest(message);
          const selectedSize = selectedSizes[message.id] || 'small';
          const conflict = freezerRequest ? hasRangeConflict(message, bookings, selectedSize) : false;
          const canAccept = freezerRequest && message.status !== 'accepted' && message.status !== 'deleted';

          return (
            <div key={message.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-stone-900">{message.name}</h3>
                  <div className="mt-1 text-sm text-stone-500">{message.email}</div>
                  {message.phone && <div className="text-sm text-stone-500">{message.phone}</div>}
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{new Date(message.created_at).toLocaleString('en-GB')}</div>
                  {message.status !== 'deleted' && (
                    <select
                      value={message.status}
                      onChange={async (e) => {
                        await contactAPI.updateStatus(message.id, e.target.value);
                        fetchData();
                      }}
                      className="rounded-full border border-stone-200 px-3 py-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
                <div><strong>Service:</strong> {message.service || '-'}</div>
                <div><strong>From:</strong> {formatDate(message.preferred_from)}</div>
                <div><strong>To:</strong> {formatDate(message.preferred_to)}</div>
                <div><strong>Preferred date:</strong> {formatDate(message.preferred_date)}</div>
                <div><strong>Guests:</strong> {message.guest_count || '-'}</div>
                <div><strong>Email consent:</strong> {message.allow_email ? 'Yes' : 'No'}</div>
                <div><strong>Phone consent:</strong> {message.allow_phone ? 'Yes' : 'No'}</div>
              </div>

              {freezerRequest && (
                <div className={`mt-5 rounded-[1.5rem] px-4 py-3 text-sm ${conflict ? 'bg-rose-50 text-rose-700' : 'bg-sky-50 text-sky-800'}`}>
                  {conflict
                    ? `The ${selectedSize} freezer is already booked for this period.`
                    : message.status === 'accepted'
                      ? 'This request is already accepted and placed in the freezer calendar.'
                      : message.status === 'deleted'
                        ? 'This request is marked as deleted.'
                        : `This request can be accepted into the ${selectedSize} freezer calendar.`}
                </div>
              )}

              <div className="mt-5 rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-7 text-stone-700">
                {message.message}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {canAccept && (
                  <>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSizes((current) => ({ ...current, [message.id]: e.target.value as 'small' | 'large' }))}
                      className="rounded-full border border-stone-200 px-4 py-2 text-sm"
                    >
                      <option value="small">Small freezer</option>
                      <option value="large">Large freezer</option>
                    </select>
                    <button
                      onClick={async () => {
                        setActionId(message.id);
                        setError(null);
                        setSuccess(null);
                        try {
                          await contactAdminAPI.accept(message.id, {
                            start_date: message.preferred_from || message.preferred_date || '',
                            end_date: message.preferred_to || message.preferred_date || message.preferred_from || '',
                            freezer_size: selectedSize,
                          });
                          setSuccess(`Freezer request accepted into the ${selectedSize} calendar.`);
                          await fetchData();
                        } catch (e: any) {
                          setError(e.message);
                        } finally {
                          setActionId(null);
                        }
                      }}
                      disabled={actionId === message.id || conflict}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionId === message.id ? 'Accepting...' : 'Accept into calendar'}
                    </button>
                  </>
                )}

                {message.status !== 'deleted' && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Mark this request as deleted?')) return;
                      await contactAPI.delete(message.id);
                      fetchData();
                    }}
                    className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
                  >
                    Delete request
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
