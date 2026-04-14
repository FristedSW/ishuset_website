import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { formCopy, translate } from '../lib/site';
import { giftCardAPI, Locale } from '../services/api';

interface GiftCardSectionProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

const emptyGiftCardForm = {
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

const GiftCardSection: React.FC<GiftCardSectionProps> = ({ locale, textLookup }) => {
  const copy = formCopy[locale];
  const [form, setForm] = useState(emptyGiftCardForm);
  const [sendToOtherRecipient, setSendToOtherRecipient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = 'checked' in event.target ? event.target.checked : false;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    if (!form.allow_email && !form.allow_phone) {
      setError(copy.consentHint);
      return;
    }

    setSubmitting(true);
    try {
      const response = await giftCardAPI.createCheckoutSession({
        ...form,
        recipient_email: sendToOtherRecipient ? form.recipient_email : form.email,
        locale,
      });
      setFeedback(
        locale === 'da'
          ? 'Du bliver sendt videre til betaling...'
          : locale === 'de'
            ? 'Sie werden jetzt zur Zahlung weitergeleitet...'
            : 'Redirecting you to payment...'
      );
      window.location.href = response.checkout_url;
    } catch (submitError: any) {
      setError(submitError.message || 'Failed to start payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="gift-cards" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-3">
            <Gift className="h-7 w-7 text-stone-900" />
            <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
              {translate(textLookup, locale, 'services_giftcard_title', 'Gift cards')}
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-stone-600">
            {locale === 'da'
              ? 'Betal gavekortet online med kort eller MobilePay. Gavekortet bliver sendt til modtageren, n\u00e5r betalingen er gennemf\u00f8rt.'
              : locale === 'de'
                ? 'Bezahlen Sie den Gutschein online mit Karte oder MobilePay. Der Gutschein wird nach erfolgreicher Zahlung an den Empf\u00e4nger gesendet.'
                : 'Pay for the gift card online with card or MobilePay. The gift card will be sent to the recipient after payment is completed.'}
          </p>
        </motion.div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>{copy.name}</span>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{copy.email}</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>{copy.phone}</span>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>{locale === 'da' ? 'Modtagernavn' : locale === 'de' ? 'Empf\u00e4ngername' : 'Recipient name'}</span>
                <input name="recipient_name" value={form.recipient_name} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>{locale === 'da' ? 'Bel\u00f8b' : locale === 'de' ? 'Betrag' : 'Amount'}</span>
                <input name="gift_amount" value={form.gift_amount} onChange={handleChange} required placeholder="100 kr" className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>
              {sendToOtherRecipient ? (
                <label className="space-y-2 text-sm font-medium">
                  <span>{locale === 'da' ? 'Modtager-email' : locale === 'de' ? 'Empf\u00e4nger-E-Mail' : 'Recipient email'}</span>
                  <input type="email" name="recipient_email" value={form.recipient_email} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
                </label>
              ) : (
                <div />
              )}
            </div>

            <label className="flex items-center gap-3 rounded-[1.5rem] bg-amber-50 p-4 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={sendToOtherRecipient}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSendToOtherRecipient(checked);
                  if (!checked) {
                    setForm((current) => ({ ...current, recipient_email: '' }));
                  }
                }}
              />
              <span>
                {locale === 'da'
                  ? 'Skal gavekortet sendes til en anden modtager?'
                  : locale === 'de'
                    ? 'Soll der Gutschein an einen anderen Empf\u00e4nger gesendet werden?'
                    : 'Should the gift card be sent to another recipient?'}
              </span>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>{copy.message}</span>
                <textarea name="message" value={form.message} onChange={handleChange} rows={4} className="w-full rounded-[1.5rem] border border-stone-200 px-4 py-3" />
              </label>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] bg-amber-50 p-4 text-sm md:grid-cols-2">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="allow_email" checked={form.allow_email} onChange={handleChange} />
                <span>{copy.allowEmail}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="allow_phone" checked={form.allow_phone} onChange={handleChange} />
                <span>{copy.allowPhone}</span>
              </label>
            </div>

            {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
            {feedback && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

            <button type="submit" disabled={submitting} className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? '...' : locale === 'da' ? 'G\u00e5 til betaling' : locale === 'de' ? 'Zur Zahlung' : 'Go to payment'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default GiftCardSection;
