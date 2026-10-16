import { site } from '../data/site';

const $ = (id: string) => document.getElementById(id) as any;
const form = $('orderForm') as HTMLFormElement;

// date min = today (local)
const d = new Date();
const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
$('date').min = iso;

// package / occasion shortcuts
document.querySelectorAll<HTMLElement>('[data-pick]').forEach((a) =>
  a.addEventListener('click', () => {
    $(a.dataset.pick === 'big' ? 'pkg-big' : 'pkg-little').checked = true;
  }),
);
document.querySelectorAll<HTMLElement>('[data-occasion]').forEach((a) =>
  a.addEventListener('click', () => {
    $('occasion').value = a.dataset.occasion;
  }),
);

// anonymous toggle
$('anon').addEventListener('change', function (this: HTMLInputElement) {
  $('signWrap').hidden = !this.checked;
});

// postal code formatting
$('postal').addEventListener('input', function (this: HTMLInputElement) {
  const v = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  this.value = v.length > 3 ? `${v.slice(0, 3)} ${v.slice(3)}` : v;
});

// validation
type Rule = [string, (v: string) => boolean, string];
const rules: Rule[] = [
  ['name', (v) => v.trim().length > 1, 'Please tell us your name.'],
  ['email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Enter an email we can reach you at, like name@example.com.'],
  ['phone', (v) => v.replace(/\D/g, '').length >= 10, 'Enter a phone number with area code, like 705-555-0123.'],
  ['occasion', (v) => v !== '', 'Choose an occasion, or pick Other.'],
  ['message', (v) => v.trim().length > 0, 'Tell us the name, age or message for the display.'],
  ['street', (v) => v.trim().length > 3, 'Enter the street address for delivery.'],
  ['town', (v) => v.trim().length > 1, 'Enter the town.'],
  ['postal', (v) => /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(v.trim()), 'Enter a postal code like L3W 0A1.'],
  ['date', (v) => v !== '' && v >= iso, 'Choose a display date that is today or later.'],
  ['window', (v) => v !== '', 'Choose a setup time window.'],
  ['card', (v) => v.trim().length > 1, 'Write a message for the greeting card.'],
];

function setErr(id: string, msg: string) {
  const el = $(id), e = $(`${id}-e`);
  if (!el || !e) return;
  e.textContent = msg || '';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  el.closest('.field')?.classList.toggle('bad', !!msg);
}
rules.forEach(([id, ok, msg]) => {
  const el = $(id);
  el.addEventListener('blur', () => setErr(id, ok(el.value) ? '' : msg));
  el.addEventListener('input', () => {
    if ($(`${id}-e`).textContent && ok(el.value)) setErr(id, '');
  });
});
document.querySelectorAll('input[name=package]').forEach((r) =>
  r.addEventListener('change', () => {
    $('pkg-e').textContent = '';
  }),
);

let lastText = '';
function build() {
  const o: Record<string, string> = {};
  new FormData(form).forEach((v, k) => (o[k] = String(v)));
  const anon = $('anon').checked;
  o.anon = anon ? 'Yes, keep me anonymous' : 'No';
  const lines = [
    'NEW ORDER REQUEST - Front Yard Signs', '',
    `Name: ${o.name}`, `Email: ${o.email}`, `Phone: ${o.phone}`, '',
    `Package: ${o.package}`, `Occasion: ${o.occasion}`, `Display text: ${o.message}`, '',
    `Delivery: ${o.street}, ${o.town} ${o.postal}`,
    `Date: ${o.date}`, `Setup window: ${o.window}`, '',
    `Card message: ${o.card}`, `Anonymous: ${o.anon}`,
    anon && o.signas ? `Sign the card as: ${o.signas}` : null,
    o.notes ? `Notes: ${o.notes}` : null,
  ].filter((x) => x !== null);
  return { data: o, text: lines.join('\n') };
}

function done(delivered: boolean) {
  $('formArea').hidden = true;
  $('thanks').hidden = false;
  $('devNote').hidden = delivered;
  $('summary').textContent = lastText;
  $('thanks').focus();
  $('order').scrollIntoView({ behavior: 'smooth' });
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  let first: HTMLElement | null = null, bad = 0;
  rules.forEach(([id, ok, msg]) => {
    const el = $(id), good = ok(el.value);
    setErr(id, good ? '' : msg);
    if (!good) { bad++; first ??= el; }
  });
  if (!document.querySelector('input[name=package]:checked')) {
    $('pkg-e').textContent = 'Choose a package.';
    bad++;
    first ??= $('pkg-little');
  }
  const alert = $('formAlert');
  if (bad) {
    alert.textContent = `Almost there! Please fix ${bad}${bad === 1 ? ' thing' : ' things'} below.`;
    alert.hidden = false;
    first?.focus();
    return;
  }
  alert.hidden = true;
  const b = build();
  lastText = b.text;
  if (site.formEndpoint) {
    fetch(site.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(b.data),
    })
      .then((r) => { if (!r.ok) throw 0; done(true); })
      .catch(() => {
        alert.textContent = 'Sorry, something went wrong sending your request. Please try again in a moment.';
        alert.hidden = false;
      });
  } else if (site.ownerEmail) {
    window.location.href = `mailto:${site.ownerEmail}?subject=${encodeURIComponent(`Display order request from ${b.data.name}`)}&body=${encodeURIComponent(b.text)}`;
    done(true);
  } else {
    done(false);
  }
});

$('copyBtn').addEventListener('click', function (this: HTMLButtonElement) {
  const btn = this;
  const ok = () => { btn.textContent = 'Copied!'; setTimeout(() => (btn.textContent = 'Copy request'), 1800); };
  const fallback = () => {
    const r = document.createRange();
    r.selectNodeContents($('summary'));
    const s = getSelection()!;
    s.removeAllRanges();
    s.addRange(r);
    btn.textContent = 'Selected. Press copy.';
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(lastText).then(ok, fallback);
  else fallback();
});
$('againBtn').addEventListener('click', () => {
  form.reset();
  $('signWrap').hidden = true;
  $('thanks').hidden = true;
  $('formArea').hidden = false;
  $('order').scrollIntoView();
});
