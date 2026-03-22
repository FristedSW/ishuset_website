import { Flavour, Locale, OpeningHours, PriceItem, TextContent } from '../services/api';

export const localeOptions: { value: Locale; label: string }[] = [
  { value: 'da', label: 'DA' },
  { value: 'en', label: 'EN' },
  { value: 'de', label: 'DE' },
];

export const dayLabels: Record<Locale, Record<string, string>> = {
  da: {
    monday: 'Mandag',
    tuesday: 'Tirsdag',
    wednesday: 'Onsdag',
    thursday: 'Torsdag',
    friday: 'Fredag',
    saturday: 'Lørdag',
    sunday: 'Søndag',
  },
  en: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  de: {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
  },
};

export const formCopy: Record<
  Locale,
  {
    name: string;
    email: string;
    phone: string;
    service: string;
    freezerType: string;
    preferredDate: string;
    guestCount: string;
    message: string;
    allowEmail: string;
    allowPhone: string;
    submit: string;
    success: string;
    consentHint: string;
    selectPlaceholder: string;
  }
> = {
  da: {
    name: 'Navn',
    email: 'Email',
    phone: 'Telefon',
    service: 'Anledning',
    freezerType: 'Frysertype',
    preferredDate: 'Ønsket dato',
    guestCount: 'Antal gæster',
    message: 'Besked',
    allowEmail: 'I må gerne kontakte mig på email',
    allowPhone: 'I må gerne kontakte mig på telefon',
    submit: 'Send forespørgsel',
    success: 'Tak. Vi har modtaget din forespørgsel og vender tilbage hurtigst muligt.',
    consentHint: 'Vælg mindst én kontaktmetode.',
    selectPlaceholder: 'Vælg',
  },
  en: {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    service: 'Occasion',
    freezerType: 'Freezer type',
    preferredDate: 'Preferred date',
    guestCount: 'Guests',
    message: 'Message',
    allowEmail: 'You may contact me by email',
    allowPhone: 'You may contact me by phone',
    submit: 'Send request',
    success: 'Thanks. We received your request and will get back to you shortly.',
    consentHint: 'Please choose at least one contact method.',
    selectPlaceholder: 'Select',
  },
  de: {
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    service: 'Anlass',
    freezerType: 'Kühltruhentyp',
    preferredDate: 'Wunschdatum',
    guestCount: 'Gäste',
    message: 'Nachricht',
    allowEmail: 'Sie dürfen mich per E-Mail kontaktieren',
    allowPhone: 'Sie dürfen mich telefonisch kontaktieren',
    submit: 'Anfrage senden',
    success: 'Danke. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich zurück.',
    consentHint: 'Bitte wählen Sie mindestens eine Kontaktmethode.',
    selectPlaceholder: 'Auswählen',
  },
};

export function buildTextLookup(texts: TextContent[]) {
  const lookup: Record<string, Record<string, string>> = {};
  for (const text of texts) {
    if (!lookup[text.locale]) {
      lookup[text.locale] = {};
    }
    lookup[text.locale][text.base_key || text.key] = text.value;
  }
  return lookup;
}

export function translate(
  lookup: Record<string, Record<string, string>>,
  locale: Locale,
  key: string,
  fallback: string
) {
  return lookup[locale]?.[key] || lookup.da?.[key] || fallback;
}

export function getFlavourName(flavour: Flavour, locale: Locale) {
  return (locale === 'de' && flavour.name_de) || (locale === 'en' && flavour.name_en) || flavour.name_da;
}

export function getFlavourDescription(flavour: Flavour, locale: Locale) {
  return (
    (locale === 'de' && flavour.description_de) ||
    (locale === 'en' && flavour.description_en) ||
    flavour.description_da
  );
}

export function getFlavourCategoryLabel(
  flavour: Flavour,
  locale: Locale,
  lookup: Record<string, Record<string, string>>
) {
  if (flavour.category === 'sorbet') {
    return translate(lookup, locale, 'flavours_filter_vegan', 'Sorbet');
  }
  return translate(lookup, locale, 'flavours_filter_milk', 'Milk-based');
}

export function getPriceLabel(item: PriceItem, locale: Locale) {
  return (locale === 'de' && item.label_de) || (locale === 'en' && item.label_en) || item.label_da;
}

export function getTodayHours(hours: OpeningHours[]) {
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return hours.find((entry) => entry.day === weekday) || hours[0];
}
