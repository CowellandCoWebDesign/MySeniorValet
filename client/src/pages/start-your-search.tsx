import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Phone, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { ProfessionalNavbar } from '@/components/ProfessionalNavbar';
import { useSEO } from '@/hooks/useSEO';

/**
 * Guided 5-step "Start Your Search" intake wizard.
 *
 * Step 1: Who needs care?      (tap auto-advances)
 * Step 2: What type of care?   (tap auto-advances)
 * Step 3: How soon?            (tap auto-advances)
 * Step 4: Where are you located? (free-text city/ZIP — nationwide, not a fixed list)
 * Step 5: Let's connect        (name required; phone OR email required)
 *
 * Submissions persist server-side and are emailed to the team; the family gets a
 * warm confirmation when they provide an email. Failures always surface a
 * "call us directly" fallback — a lead is never silently dropped.
 */

const PLACEMENT_PHONE_DISPLAY = '(530) 776-4220';
const PLACEMENT_PHONE_TEL = '+15307764220';

const TOTAL_STEPS = 5;

const RELATIONSHIP_OPTIONS = [
  { value: 'myself', emoji: '🙋', label: 'Myself' },
  { value: 'parent', emoji: '👩‍🦳', label: 'A parent' },
  { value: 'spouse_partner', emoji: '💑', label: 'A spouse or partner' },
  { value: 'someone_else', emoji: '🤝', label: 'Someone else' },
];

const CARE_TYPE_OPTIONS = [
  { value: 'assisted_living', emoji: '🏡', label: 'Assisted Living', sublabel: 'Help with daily activities in a community setting' },
  { value: 'memory_care', emoji: '🧠', label: 'Memory Care', sublabel: "Specialized support for Alzheimer's & dementia" },
  { value: 'independent_living', emoji: '🌳', label: 'Independent Living', sublabel: 'Active, maintenance-free senior communities' },
  { value: 'not_sure', emoji: '🤔', label: 'Not sure yet', sublabel: "We'll help you figure out the right fit" },
];

const URGENCY_OPTIONS = [
  { value: 'immediately', emoji: '🚨', label: 'Immediately', sublabel: 'We need help right away' },
  { value: 'within_30_days', emoji: '📅', label: 'Within 30 days', sublabel: 'Planning a move soon' },
  { value: 'one_to_three_months', emoji: '🗓️', label: '1–3 months', sublabel: 'Getting our plans in order' },
  { value: 'just_researching', emoji: '🔍', label: 'Just researching', sublabel: 'Exploring options for the future' },
];

const CARE_TYPE_SEARCH_LABELS: Record<string, string> = {
  assisted_living: 'Assisted Living',
  memory_care: 'Memory Care',
  independent_living: 'Independent Living',
};

const STEP_TITLES: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Who needs care?', subtitle: 'Tell us who we can help support.' },
  2: { title: 'What type of care?', subtitle: "Choose the option that fits best — or let us help you decide." },
  3: { title: 'How soon do you need help?', subtitle: 'This helps us prioritize your request.' },
  4: { title: 'Where are you located?', subtitle: 'We help families nationwide — enter any city or ZIP code.' },
  5: { title: "Let's connect", subtitle: "A real person from our placement team will follow up — always free for families." },
};

interface Answers {
  relationship: string;
  careType: string;
  urgency: string;
  location: string;
  name: string;
  phone: string;
  email: string;
}

function OptionCard({
  emoji,
  label,
  sublabel,
  selected,
  onSelect,
  testId,
}: {
  emoji: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={testId}
      className={`w-full flex items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 text-left transition-all shadow-sm hover:shadow-md active:scale-[0.99] ${
        selected
          ? 'border-green-700 bg-green-50'
          : 'border-gray-200 bg-white hover:border-green-400'
      }`}
    >
      <span className="text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true">{emoji}</span>
      <span className="min-w-0">
        <span className="block text-lg sm:text-xl font-semibold text-gray-900">{label}</span>
        {sublabel && <span className="block text-sm text-gray-500 mt-0.5">{sublabel}</span>}
      </span>
    </button>
  );
}

export default function StartYourSearch() {
  const [, setLocation] = useLocation();

  useSEO({
    title: 'Start Your Search — Free Senior Placement Guidance',
    description:
      'Answer five quick questions and our senior placement team will personally help you find the right Assisted Living, Memory Care, or Independent Living community. Free for families, nationwide.',
    keywords:
      'senior placement services, free senior living guidance, find assisted living, memory care help, senior care advisor',
  });

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    relationship: '',
    careType: '',
    urgency: '',
    location: '',
    name: '',
    phone: '',
    email: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const pick = useCallback((field: keyof Answers, value: string, autoAdvance = true) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    if (autoAdvance) {
      // Brief pause so the selected state is visible before advancing.
      setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 150);
    }
  }, []);

  const goBack = useCallback(() => {
    setSubmitError('');
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const continueFromLocation = useCallback(() => {
    const loc = answers.location.trim();
    if (loc.length < 2) {
      setFieldErrors((prev) => ({ ...prev, location: 'Please enter your city or ZIP code.' }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, location: '' }));
    setStep(5);
  }, [answers.location]);

  const validateContact = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    const name = answers.name.trim();
    const phone = answers.phone.trim();
    const email = answers.email.trim();

    if (!name) errors.name = 'Please tell us your name.';
    if (!phone && !email) {
      errors.phone = 'Please share a phone number or an email so we can reach you.';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "That email doesn't look right — double-check it for us?";
    }
    if (phone && phone.replace(/[^\d]/g, '').length < 7) {
      errors.phone = "That phone number doesn't look right — double-check it for us?";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [answers]);

  const handleSubmit = useCallback(async () => {
    if (!validateContact()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/placement-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: answers.relationship,
          careType: answers.careType,
          urgency: answers.urgency,
          location: answers.location.trim(),
          name: answers.name.trim(),
          phone: answers.phone.trim(),
          email: answers.email.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.success) {
        setSubmitError(body?.error || 'We couldn\'t submit your request.');
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('We couldn\'t submit your request.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, validateContact]);

  // Browse link for the success screen, built from the family's answers.
  const browseQuery = (() => {
    const loc = answers.location.trim();
    if (!loc) return '';
    const care = CARE_TYPE_SEARCH_LABELS[answers.careType];
    return care ? `${care} in ${loc}` : loc;
  })();

  const stepMeta = STEP_TITLES[step];

  return (
    <>
      <ProfessionalNavbar />
      <main
        className="min-h-screen pt-24 pb-16 px-4"
        style={{ background: 'linear-gradient(180deg, #f4f7ef 0%, #ffffff 40%)' }}
      >
        <div className="max-w-lg mx-auto">
          {submitted ? (
            /* ── Success screen ─────────────────────────────────────── */
            <div className="text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10" data-testid="intake-success">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">We'll be in touch soon!</h1>
              <p className="text-gray-600 mt-3 leading-relaxed">
                Thank you, {answers.name.trim().split(/\s+/)[0] || 'friend'}. Our placement team has your
                request and a real person will follow up shortly — usually within one business day.
              </p>
              <p className="text-gray-600 mt-3">Prefer to talk now? Give us a call:</p>
              <a
                href={`tel:${PLACEMENT_PHONE_TEL}`}
                data-testid="link-success-call"
                className="inline-flex items-center gap-2 mt-4 px-7 py-3 bg-green-700 hover:bg-green-800 text-white text-lg font-bold rounded-lg shadow transition-colors no-underline"
              >
                <Phone className="w-5 h-5" />
                {PLACEMENT_PHONE_DISPLAY}
              </a>
              {browseQuery && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Want to explore while you wait?</p>
                  <button
                    type="button"
                    onClick={() => setLocation(`/map-search?q=${encodeURIComponent(browseQuery)}`)}
                    data-testid="link-success-browse"
                    className="text-green-700 hover:text-green-800 font-semibold underline underline-offset-2"
                  >
                    See communities near {answers.location.trim()} →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* ── Progress ─────────────────────────────────────────── */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      data-testid="button-wizard-back"
                      className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <span className="text-sm font-medium text-gray-500" data-testid="text-step-indicator">
                    Step {step} of {TOTAL_STEPS}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  />
                </div>
              </div>

              {/* ── Step header ──────────────────────────────────────── */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{stepMeta.title}</h1>
                <p className="text-gray-500 mt-2">{stepMeta.subtitle}</p>
              </div>

              {/* ── Step 1: relationship ─────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-3">
                  {RELATIONSHIP_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.value}
                      emoji={o.emoji}
                      label={o.label}
                      selected={answers.relationship === o.value}
                      onSelect={() => pick('relationship', o.value)}
                      testId={`card-relationship-${o.value}`}
                    />
                  ))}
                </div>
              )}

              {/* ── Step 2: care type ────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-3">
                  {CARE_TYPE_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.value}
                      emoji={o.emoji}
                      label={o.label}
                      sublabel={o.sublabel}
                      selected={answers.careType === o.value}
                      onSelect={() => pick('careType', o.value)}
                      testId={`card-care-type-${o.value}`}
                    />
                  ))}
                </div>
              )}

              {/* ── Step 3: urgency ──────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-3">
                  {URGENCY_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.value}
                      emoji={o.emoji}
                      label={o.label}
                      sublabel={o.sublabel}
                      selected={answers.urgency === o.value}
                      onSelect={() => pick('urgency', o.value)}
                      testId={`card-urgency-${o.value}`}
                    />
                  ))}
                </div>
              )}

              {/* ── Step 4: location ─────────────────────────────────── */}
              {step === 4 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <label htmlFor="intake-location" className="block text-sm font-medium text-gray-700 mb-2">
                    City or ZIP code
                  </label>
                  <input
                    id="intake-location"
                    type="text"
                    inputMode="text"
                    autoComplete="postal-code"
                    autoFocus
                    value={answers.location}
                    onChange={(e) => pick('location', e.target.value, false)}
                    onKeyDown={(e) => e.key === 'Enter' && continueFromLocation()}
                    placeholder="e.g. Sacramento, CA or 95814"
                    data-testid="input-intake-location"
                    className={`w-full px-4 py-3.5 text-lg rounded-xl border-2 focus:outline-none focus:border-green-600 ${
                      fieldErrors.location ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {fieldErrors.location && (
                    <p className="text-sm text-red-600 mt-2" data-testid="error-intake-location">{fieldErrors.location}</p>
                  )}
                  <button
                    type="button"
                    onClick={continueFromLocation}
                    data-testid="button-location-continue"
                    className="w-full mt-4 px-6 py-3.5 bg-green-700 hover:bg-green-800 text-white text-lg font-semibold rounded-xl shadow transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* ── Step 5: contact ──────────────────────────────────── */}
              {step === 5 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                  <div>
                    <label htmlFor="intake-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="intake-name"
                      type="text"
                      autoComplete="name"
                      value={answers.name}
                      onChange={(e) => pick('name', e.target.value, false)}
                      placeholder="First and last name"
                      data-testid="input-intake-name"
                      className={`w-full px-4 py-3 text-base rounded-xl border-2 focus:outline-none focus:border-green-600 ${
                        fieldErrors.name ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-sm text-red-600 mt-1.5" data-testid="error-intake-name">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="intake-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone number
                    </label>
                    <input
                      id="intake-phone"
                      type="tel"
                      autoComplete="tel"
                      value={answers.phone}
                      onChange={(e) => pick('phone', e.target.value, false)}
                      placeholder="(555) 555-5555"
                      data-testid="input-intake-phone"
                      className={`w-full px-4 py-3 text-base rounded-xl border-2 focus:outline-none focus:border-green-600 ${
                        fieldErrors.phone ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-sm text-red-600 mt-1.5" data-testid="error-intake-phone">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="intake-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="intake-email"
                      type="email"
                      autoComplete="email"
                      value={answers.email}
                      onChange={(e) => pick('email', e.target.value, false)}
                      placeholder="you@example.com"
                      data-testid="input-intake-email"
                      className={`w-full px-4 py-3 text-base rounded-xl border-2 focus:outline-none focus:border-green-600 ${
                        fieldErrors.email ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-red-600 mt-1.5" data-testid="error-intake-email">{fieldErrors.email}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1.5">Phone or email — whichever you prefer, we just need one.</p>
                  </div>

                  {submitError && (
                    <div
                      className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
                      data-testid="error-intake-submit"
                    >
                      <p className="font-semibold">{submitError}</p>
                      <p className="mt-1">
                        Please try again or call us directly at{' '}
                        <a href={`tel:${PLACEMENT_PHONE_TEL}`} className="font-bold underline whitespace-nowrap">
                          {PLACEMENT_PHONE_DISPLAY}
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    data-testid="button-intake-submit"
                    className="w-full px-6 py-4 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-lg font-semibold rounded-xl shadow transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {submitting ? 'Sending…' : 'Get My Free Guidance'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Free for families. We never sell your information.
                  </p>
                </div>
              )}

              {/* Phone fallback under every step */}
              <p className="text-center text-sm text-gray-500 mt-8">
                Prefer to talk to a person?{' '}
                <a href={`tel:${PLACEMENT_PHONE_TEL}`} className="text-green-700 font-semibold whitespace-nowrap" data-testid="link-wizard-call">
                  Call {PLACEMENT_PHONE_DISPLAY}
                </a>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
