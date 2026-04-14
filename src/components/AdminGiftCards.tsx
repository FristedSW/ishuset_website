import React, { useEffect, useState } from 'react';
import { giftCardAPI, GiftCard, GiftCardRequest } from '../services/api';
import { CheckCircle2, Plus } from 'lucide-react';

const emptyCreateForm: GiftCardRequest = {
  name: '',
  email: '',
  phone: '',
  recipient_name: '',
  recipient_email: '',
  gift_amount: '',
  allow_email: true,
  allow_phone: false,
  message: '',
};

export default function AdminGiftCards() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<GiftCardRequest>(emptyCreateForm);
  const [error, setError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const fetchCards = async (code?: string) => {
    try {
      const data = await giftCardAPI.getAll(code ? { code } : undefined);
      setCards(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Gift cards</h2>
        <p className="mt-2 text-sm text-stone-500">Search by code, update balances, or create a new gift card directly from the admin panel.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
      {createMessage && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{createMessage}</div>}

      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-stone-900">Create gift card</h3>
            <p className="mt-1 text-sm text-stone-500">Use this when staff want to issue a gift card and email it without payment.</p>
          </div>
          <button
            onClick={() => setCreateOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
          >
            <Plus className="h-4 w-4" />
            {createOpen ? 'Close' : 'Add gift card'}
          </button>
        </div>

        {createOpen && (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setCreateMessage(null);
              try {
                const result = await giftCardAPI.createFromAdmin(createForm);
                setCreateForm(emptyCreateForm);
                setCreateOpen(false);
                await fetchCards(searchCode);
                setCreateMessage(
                  result.warning
                    ? `Gift card ${result.card.code} was created, but email could not be sent.`
                    : `Gift card ${result.card.code} was created${result.email_sent ? ' and emailed' : ''}.`
                );
                window.setTimeout(() => setCreateMessage(null), 4500);
              } catch (e: any) {
                setError(e.message);
              }
            }}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              value={createForm.name}
              onChange={(e) => setCreateForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Buyer name"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((current) => ({ ...current, email: e.target.value }))}
              placeholder="Buyer email"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
            <input
              value={createForm.phone || ''}
              onChange={(e) => setCreateForm((current) => ({ ...current, phone: e.target.value }))}
              placeholder="Buyer phone"
              className="rounded-2xl border border-stone-200 px-4 py-3"
            />
            <input
              value={createForm.gift_amount}
              onChange={(e) => setCreateForm((current) => ({ ...current, gift_amount: e.target.value }))}
              placeholder="Amount"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
            <input
              value={createForm.recipient_name}
              onChange={(e) => setCreateForm((current) => ({ ...current, recipient_name: e.target.value }))}
              placeholder="Recipient name"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
            <input
              type="email"
              value={createForm.recipient_email}
              onChange={(e) => setCreateForm((current) => ({ ...current, recipient_email: e.target.value }))}
              placeholder="Recipient email"
              className="rounded-2xl border border-stone-200 px-4 py-3"
              required
            />
            <textarea
              value={createForm.message || ''}
              onChange={(e) => setCreateForm((current) => ({ ...current, message: e.target.value }))}
              placeholder="Message"
              rows={4}
              className="min-h-28 rounded-[1.5rem] border border-stone-200 px-4 py-3 md:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={createForm.allow_email}
                onChange={(e) => setCreateForm((current) => ({ ...current, allow_email: e.target.checked }))}
              />
              Email contact allowed
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={createForm.allow_phone}
                onChange={(e) => setCreateForm((current) => ({ ...current, allow_phone: e.target.checked }))}
              />
              Phone contact allowed
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                Create and send
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex gap-3">
        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Search code"
          className="w-full max-w-sm rounded-2xl border border-stone-200 px-4 py-3"
        />
        <button onClick={() => fetchCards(searchCode)} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
          Search
        </button>
        <button onClick={() => { setSearchCode(''); fetchCards(); }} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {cards.map((card) => (
          <GiftCardRow key={card.id} card={card} onUpdated={() => fetchCards(searchCode)} />
        ))}
      </div>
    </div>
  );
}

function GiftCardRow({ card, onUpdated }: { card: GiftCard; onUpdated: () => void }) {
  const [balance, setBalance] = useState(card.balance_amount);
  const [status, setStatus] = useState(card.status);
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-stone-400">{card.code}</div>
          <h3 className="mt-2 text-2xl font-semibold text-stone-900">{card.recipient_name}</h3>
          <div className="mt-1 text-sm text-stone-500">{card.recipient_email}</div>
          <div className="mt-1 text-sm text-stone-500">{card.buyer_name} | {card.buyer_email}</div>
        </div>
        <div className="text-right text-sm text-stone-500">
          <div>Original: {card.original_amount}</div>
          <div>Payment: {card.payment_status || 'manual'}</div>
          <div>Created: {new Date(card.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium">
          <span>Remaining balance</span>
          <input value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-stone-200 px-4 py-3">
            <option value="active">active</option>
            <option value="used">used</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            onClick={async () => {
              const updated = await giftCardAPI.update(card.id, { balance_amount: balance, status });
              setBalance(updated.balance_amount);
              setStatus(updated.status);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
              onUpdated();
            }}
            className="w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
          >
            Update
          </button>
        </div>
      </div>

      {saved && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Updated
        </div>
      )}

      {card.message && <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-4 text-sm text-stone-600">{card.message}</div>}
    </div>
  );
}
