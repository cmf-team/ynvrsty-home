// signup.js — email capture for the YNVRSTY apex page.
//
// Posts to a Google Form, whose responses land in a spreadsheet we control.
// No third-party script runs on this page; this is a plain cross-origin POST.
//
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
// Both values come from the form's *pre-filled link*
// (Google Forms → ⋮ → "Get pre-filled link" → fill anything → "Get link"):
//
//   https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456789=test
//                                     ^^^^^^^                     ^^^^^^^^^^^^^^^^
//
// Leave them empty and the form renders visibly disabled — better than a box
// that silently swallows addresses.
const FORM_ID = '1FAIpQLSdBTXky9nIVgsv9Nmw0pgfeBAzjQMo244m_7JIivTB8v5x5pg';
const ENTRY_ID = 'entry.871973488';

const ENDPOINT = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

// Deliberately loose. The real check is Google's, and we cannot see its answer
// (below) — this only catches the obvious typo before we claim success.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const form = document.getElementById('signup-form');
const input = document.getElementById('email');
const button = document.getElementById('signup-submit');
const message = document.getElementById('signup-msg');

function say(text, kind) {
  message.textContent = text;
  message.className = 'signup-msg' + (kind ? ' is-' + kind : '');
}

if (!FORM_ID || !ENTRY_ID) {
  input.disabled = true;
  button.disabled = true;
  say('Signup is not connected yet — check back shortly.', 'err');
} else {
  form.addEventListener('submit', async (event) => {
    // Always cancel the native submit: the CSP sets form-action 'none', so a
    // real navigation would be blocked anyway.
    event.preventDefault();

    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      say('That does not look like an email address.', 'err');
      input.focus();
      return;
    }

    input.disabled = true;
    button.disabled = true;
    say('Sending…');

    try {
      // Google Forms sends no CORS headers, so the response is opaque: we
      // cannot read the status and cannot distinguish "accepted" from
      // "rejected". A network-level failure still rejects, which is the one
      // real error we can report honestly.
      //
      // URLSearchParams keeps the content type CORS-safelisted, so no preflight
      // is attempted — a preflight would fail outright in no-cors mode.
      //
      // Redirects are followed (the default). Do NOT set redirect:'manual' here
      // — combined with no-cors it throws TypeError in Chrome unconditionally,
      // which surfaces as a false "could not reach the server" on every submit.
      // The CSP does check redirect targets, but Google answers this POST on
      // docs.google.com, which connect-src already allows.
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ [ENTRY_ID]: email }),
      });

      form.hidden = true;
      say('Thanks — we will write to you when applications open.', 'ok');
    } catch (err) {
      input.disabled = false;
      button.disabled = false;
      say('Could not reach the server. Check your connection and try again.', 'err');
    }
  });
}
