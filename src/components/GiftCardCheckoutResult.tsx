import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { giftCardAPI, GiftCardCheckoutStatus } from '../services/api';

type Mode = 'success' | 'cancel';

interface GiftCardCheckoutResultProps {
  mode: Mode;
}

export default function GiftCardCheckoutResult({ mode }: GiftCardCheckoutResultProps) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<GiftCardCheckoutStatus | null>(null);
  const [loading, setLoading] = useState(mode === 'success');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'success') return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Missing Stripe session id.');
      setLoading(false);
      return;
    }

    giftCardAPI
      .getCheckoutStatus(sessionId)
      .then((response) => {
        setStatus(response);
      })
      .catch((fetchError: any) => {
        setError(fetchError.message || 'Failed to verify payment');
      })
      .finally(() => setLoading(false));
  }, [mode, searchParams]);

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-20 text-stone-900">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 shadow-sm">
        {mode === 'success' ? (
          <>
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400">Gift cards</div>
            <h1 className="mt-3 font-serif text-4xl font-bold">Payment status</h1>
            {loading && <p className="mt-4 text-stone-600">We are verifying your payment and preparing the gift card.</p>}
            {error && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
            {!loading && !error && status && (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-emerald-50 p-5">
                  <div className="text-sm uppercase tracking-[0.2em] text-emerald-700">Stripe</div>
                  <div className="mt-2 text-lg font-semibold text-emerald-900">{status.payment_status}</div>
                </div>
                <div className="rounded-[1.5rem] bg-stone-50 p-5">
                  <div className="text-sm text-stone-500">Gift card code</div>
                  <div className="mt-2 text-2xl font-semibold">{status.card.code}</div>
                  <p className="mt-3 text-sm text-stone-600">
                    {status.payment_status === 'paid'
                      ? `The gift card for ${status.card.recipient_name} has been activated. If SMTP is configured, the email has been sent to ${status.card.recipient_email}.`
                      : 'The payment is still being processed. Please refresh in a moment if needed.'}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400">Gift cards</div>
            <h1 className="mt-3 font-serif text-4xl font-bold">Payment cancelled</h1>
            <p className="mt-4 text-stone-600">
              The payment was not completed, so the gift card has not been activated yet.
            </p>
          </>
        )}

        <div className="mt-8 flex gap-3">
          <Link to="/" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Back to website
          </Link>
          <a href="/#gift-cards" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
            Gift cards
          </a>
        </div>
      </div>
    </div>
  );
}
