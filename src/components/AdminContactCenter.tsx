import React, { useEffect, useState } from 'react';
import { contactAPI, ContactMessage } from '../services/api';

export default function AdminContactCenter() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await contactAPI.getAll();
      setMessages(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Incoming requests</h2>
        <p className="mt-2 text-sm text-stone-500">These are request-based enquiries only. Nothing is automatically booked or blocked.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-stone-500">Loading requests...</div>}

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-stone-900">{message.name}</h3>
                <div className="mt-1 text-sm text-stone-500">{message.email}</div>
                {message.phone && <div className="text-sm text-stone-500">{message.phone}</div>}
              </div>
              <div className="space-y-2 text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{new Date(message.created_at).toLocaleString()}</div>
                <select
                  value={message.status}
                  onChange={async (e) => {
                    await contactAPI.updateStatus(message.id, e.target.value);
                    fetchMessages();
                  }}
                  className="rounded-full border border-stone-200 px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
              <div><strong>Service:</strong> {message.service || '-'}</div>
              <div><strong>Event type:</strong> {message.event_type || '-'}</div>
              <div><strong>Recipient:</strong> {message.recipient_name || '-'}</div>
              <div><strong>Gift amount:</strong> {message.gift_amount || '-'}</div>
              <div><strong>From:</strong> {message.preferred_from ? new Date(message.preferred_from).toLocaleDateString() : '-'}</div>
              <div><strong>To:</strong> {message.preferred_to ? new Date(message.preferred_to).toLocaleDateString() : '-'}</div>
              <div><strong>Preferred date:</strong> {message.preferred_date ? new Date(message.preferred_date).toLocaleDateString() : '-'}</div>
              <div><strong>Guests:</strong> {message.guest_count || '-'}</div>
              <div><strong>Email consent:</strong> {message.allow_email ? 'Yes' : 'No'}</div>
              <div><strong>Phone consent:</strong> {message.allow_phone ? 'Yes' : 'No'}</div>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-7 text-stone-700">
              {message.message}
            </div>

            <button
              onClick={async () => {
                if (!window.confirm('Delete this request?')) return;
                await contactAPI.delete(message.id);
                fetchMessages();
              }}
              className="mt-4 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
            >
              Delete request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
