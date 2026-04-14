import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Snowflake } from 'lucide-react';
import { formCopy, translate } from '../lib/site';
import { contactAPI, Locale } from '../services/api';

interface SpecialServicesProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

const freezerOccasionOptions = {
  da: ['F\u00f8dselsdag', 'Firmaevent', 'Bryllup', 'Andet'],
  en: ['Birthday', 'Company event', 'Wedding', 'Other'],
  de: ['Geburtstag', 'Firmenevent', 'Hochzeit', 'Sonstiges'],
};

const priceEstimates = {
  da: [
    { label: 'Lille fryser', value: 'Fra 800 kr / dag' },
    { label: 'Stor fryser', value: 'Fra 1.600 kr / dag' },
  ],
  en: [
    { label: 'Small freezer', value: 'From 800 DKK / day' },
    { label: 'Large freezer', value: 'From 1,600 DKK / day' },
  ],
  de: [
    { label: 'Kleine K\u00fchltruhe', value: 'Ab 800 DKK / Tag' },
    { label: 'Gro\u00dfe K\u00fchltruhe', value: 'Ab 1.600 DKK / Tag' },
  ],
};

const emptyFreezerForm = {
  name: '',
  email: '',
  phone: '',
  service: '',
  preferred_from: '',
  preferred_to: '',
  guest_count: 0,
  allow_email: true,
  allow_phone: false,
  message: '',
};

const FORMSPREE_REQUEST_URL = process.env.REACT_APP_FORMSPREE_REQUEST_URL || '';

const SpecialServices: React.FC<SpecialServicesProps> = ({ locale, textLookup }) => {
  const copy = formCopy[locale];
  const [freezerForm, setFreezerForm] = useState(emptyFreezerForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fromDateRef = useRef<HTMLInputElement | null>(null);
  const toDateRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = 'checked' in event.target ? event.target.checked : false;
    setFreezerForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'guest_count' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);
    if (!freezerForm.allow_email && !freezerForm.allow_phone) {
      setError(copy.consentHint);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...freezerForm,
        preferred_from: freezerForm.preferred_from || undefined,
        preferred_to: freezerForm.preferred_to || undefined,
        guest_count: freezerForm.guest_count || undefined,
      };

      await contactAPI.submit(payload);

      if (FORMSPREE_REQUEST_URL) {
        await fetch(FORMSPREE_REQUEST_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            source: 'Ishuset website freezer request',
            ...payload,
            locale,
          }),
        }).catch(() => null);
      }

      setFeedback(copy.success);
      setFreezerForm(emptyFreezerForm);
    } catch (submitError: any) {
      setError(submitError.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="services" className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <Snowflake className="h-7 w-7 text-stone-900" />
            <h2 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
              {translate(textLookup, locale, 'services_title', 'Rent a freezer')}
            </h2>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-stone-600">
            {translate(textLookup, locale, 'services_subtitle', 'Send a request for freezer rental for parties and events.')}
          </p>
        </motion.div>

        <div className="space-y-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-semibold text-stone-900">
              {locale === 'da' ? 'Prisoverslag' : locale === 'de' ? 'Preis\u00fcbersicht' : 'Estimated pricing'}
            </h3>
            <div className="mt-5 space-y-3">
              {priceEstimates[locale].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                  <span className="text-sm font-medium text-stone-700">{item.label}</span>
                  <span className="text-sm font-semibold text-stone-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 text-stone-900 shadow-sm">
            <h3 className="font-serif text-3xl font-bold">
              {translate(textLookup, locale, 'services_form_title', 'Freezer request')}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-500">
              {locale === 'da'
                ? 'Send en generel foresp\u00f8rgsel med datoer og arrangement. Vi v\u00e6lger selv lille eller stor fryser i admin.'
                : locale === 'de'
                  ? 'Senden Sie eine allgemeine Anfrage mit Datum und Anlass. Im Adminbereich w\u00e4hlen wir dann selbst kleine oder gro\u00dfe K\u00fchltruhe.'
                  : 'Send a general request with dates and event details. We will choose the small or large freezer in the admin panel.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>{copy.name}</span>
                  <input name="name" value={freezerForm.name} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{copy.email}</span>
                  <input type="email" name="email" value={freezerForm.email} onChange={handleChange} required className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>{copy.phone}</span>
                  <input name="phone" value={freezerForm.phone} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{copy.service}</span>
                  <select name="service" value={freezerForm.service} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3">
                    <option value="">{copy.selectPlaceholder}</option>
                    {freezerOccasionOptions[locale].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>{locale === 'da' ? 'Fra dato' : locale === 'de' ? 'Von Datum' : 'From date'}</span>
                  <div className="relative">
                    <input
                      ref={fromDateRef}
                      type="date"
                      lang="en-GB"
                      name="preferred_from"
                      value={freezerForm.preferred_from}
                      onChange={handleChange}
                      className="hide-native-date-icon w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => fromDateRef.current?.showPicker?.()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-100 p-2 text-stone-600"
                      aria-label="Open from date picker"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{locale === 'da' ? 'Til dato' : locale === 'de' ? 'Bis Datum' : 'To date'}</span>
                  <div className="relative">
                    <input
                      ref={toDateRef}
                      type="date"
                      lang="en-GB"
                      name="preferred_to"
                      value={freezerForm.preferred_to}
                      onChange={handleChange}
                      className="hide-native-date-icon w-full rounded-2xl border border-stone-200 px-4 py-3 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => toDateRef.current?.showPicker?.()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-stone-100 p-2 text-stone-600"
                      aria-label="Open to date picker"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium">
                <span>{copy.guestCount}</span>
                <input type="number" min={0} name="guest_count" value={freezerForm.guest_count || ''} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>{copy.message}</span>
                <textarea name="message" value={freezerForm.message} onChange={handleChange} required rows={5} className="w-full rounded-[1.5rem] border border-stone-200 px-4 py-3" />
              </label>

              <div className="grid gap-3 rounded-[1.5rem] bg-amber-50 p-4 text-sm md:grid-cols-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="allow_email" checked={freezerForm.allow_email} onChange={handleChange} />
                  <span>{copy.allowEmail}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="allow_phone" checked={freezerForm.allow_phone} onChange={handleChange} />
                  <span>{copy.allowPhone}</span>
                </label>
              </div>

              {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>}
              {feedback && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div>}

              <button type="submit" disabled={submitting} className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? '...' : copy.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialServices;
