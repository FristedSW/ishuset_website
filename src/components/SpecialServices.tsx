import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';
import { formCopy, translate } from '../lib/site';
import { contactAPI, Locale } from '../services/api';

interface SpecialServicesProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

const freezerOccasionOptions = {
  da: ['Fødselsdag', 'Firmaevent', 'Bryllup', 'Andet'],
  en: ['Birthday', 'Company event', 'Wedding', 'Other'],
  de: ['Geburtstag', 'Firmenevent', 'Hochzeit', 'Sonstiges'],
};

const freezerTypeOptions = {
  da: ['Lille fryser', 'Mellem fryser', 'Stor fryser'],
  en: ['Small freezer', 'Medium freezer', 'Large freezer'],
  de: ['Kleine Kühltruhe', 'Mittlere Kühltruhe', 'Große Kühltruhe'],
};

const priceEstimates = {
  da: [
    { label: 'Lille fryser', value: 'Fra 800 kr / dag' },
    { label: 'Mellem fryser', value: 'Fra 1.200 kr / dag' },
    { label: 'Stor fryser', value: 'Fra 1.600 kr / dag' },
  ],
  en: [
    { label: 'Small freezer', value: 'From 800 DKK / day' },
    { label: 'Medium freezer', value: 'From 1,200 DKK / day' },
    { label: 'Large freezer', value: 'From 1,600 DKK / day' },
  ],
  de: [
    { label: 'Kleine Kühltruhe', value: 'Ab 800 DKK / Tag' },
    { label: 'Mittlere Kühltruhe', value: 'Ab 1.200 DKK / Tag' },
    { label: 'Große Kühltruhe', value: 'Ab 1.600 DKK / Tag' },
  ],
};

const emptyFreezerForm = {
  name: '',
  email: '',
  phone: '',
  service: '',
  event_type: '',
  preferred_from: '',
  preferred_to: '',
  guest_count: 0,
  allow_email: true,
  allow_phone: false,
  message: '',
};

const SpecialServices: React.FC<SpecialServicesProps> = ({ locale, textLookup }) => {
  const copy = formCopy[locale];
  const [freezerForm, setFreezerForm] = useState(emptyFreezerForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      await contactAPI.submit({
        ...freezerForm,
        preferred_from: freezerForm.preferred_from || undefined,
        preferred_to: freezerForm.preferred_to || undefined,
        guest_count: freezerForm.guest_count || undefined,
      });
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
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
          <div className="space-y-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-stone-900">
                {locale === 'da' ? 'Prisoverslag' : locale === 'de' ? 'Preisübersicht' : 'Estimated pricing'}
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
          </div>

          <div className="rounded-[2rem] bg-white p-8 text-stone-900 shadow-sm">
            <h3 className="font-serif text-3xl font-bold">
              {translate(textLookup, locale, 'services_form_title', 'Freezer request')}
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-500">
              {translate(textLookup, locale, 'services_form_intro', 'Choose a freezer type, preferred date and tell us a bit about your event.')}
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

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm font-medium">
                  <span>{copy.freezerType}</span>
                  <select name="event_type" value={freezerForm.event_type} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3">
                    <option value="">{copy.selectPlaceholder}</option>
                    {freezerTypeOptions[locale].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{locale === 'da' ? 'Fra dato' : locale === 'de' ? 'Von Datum' : 'From date'}</span>
                  <input type="date" name="preferred_from" value={freezerForm.preferred_from} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{locale === 'da' ? 'Til dato' : locale === 'de' ? 'Bis Datum' : 'To date'}</span>
                  <input type="date" name="preferred_to" value={freezerForm.preferred_to} onChange={handleChange} className="w-full rounded-2xl border border-stone-200 px-4 py-3" />
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
