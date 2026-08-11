/* Enquiry form — client-side validation and WhatsApp handoff.

   There is no backend in this demo. On submit we validate, then hand
   the enquiry to WhatsApp with the message pre-filled, which is how
   most Indian preschool enquiries actually convert. To post to a real
   endpoint instead, see the note in README.md. */

const WA_NUMBER = '911234567890';

const rules = {
  'f-name': (v) =>
    v.trim().length >= 2 ? '' : 'Please enter your name.',
  'f-phone': (v) =>
    /^[6-9]\d{9}$/.test(v.trim())
      ? ''
      : 'Enter a 10-digit Indian mobile number, starting 6–9.',
  'f-dob': (v) => {
    if (!v) return 'Please enter your child’s date of birth.';
    const dob = new Date(v);
    if (Number.isNaN(dob.getTime())) return 'That date doesn’t look right.';
    if (dob > new Date()) return 'The date of birth can’t be in the future.';
    const months =
      (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (months > 84) return 'Our oldest programme is for children under 5½.';
    return '';
  },
};

function validateField(input) {
  const rule = rules[input.id];
  if (!rule) return true;

  const message = rule(input.value);
  const field   = input.closest('.field');
  const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);

  field?.classList.toggle('has-error', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (errorEl) errorEl.textContent = message;

  return !message;
}

export function initForm() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const status = document.getElementById('formStatus');
  const phone  = document.getElementById('f-phone');

  /* Keep the phone field to digits only. */
  phone?.addEventListener('input', () => {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
  });

  /* Validate on blur, then live once the field has been touched. */
  Object.keys(rules).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = Object.keys(rules).map((id) => document.getElementById(id));
    const valid  = inputs.every((input) => (input ? validateField(input) : true));

    if (!valid) {
      status.textContent = 'Please correct the highlighted fields.';
      inputs.find((i) => i?.closest('.field')?.classList.contains('has-error'))?.focus();
      return;
    }

    const data = new FormData(form);
    const message =
      `Hello Gulmohar Early Years,\n\n` +
      `I'd like to book a campus visit.\n\n` +
      `Parent: ${data.get('name')}\n` +
      `Mobile: +91 ${data.get('phone')}\n` +
      `Child's DOB: ${data.get('dob')}\n` +
      `Programme: ${data.get('program')}\n` +
      `Centre: ${data.get('centre')}\n` +
      (data.get('message') ? `Note: ${data.get('message')}\n` : '');

    status.textContent =
      'Thank you — opening WhatsApp so you can send this straight to us.';

    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener'
    );
  });
}
