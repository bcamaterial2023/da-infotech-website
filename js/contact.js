/* ==========================================================================
   DA INFOTECH — CONTACT FORM
   --------------------------------------------------------------------------
   Client-side validation, then submission.

   ⚠ NO BACKEND IS CONFIGURED, and the form does not pretend otherwise.
   With ENDPOINT null it opens the visitor's email client with the enquiry
   pre-filled and says exactly that on screen. It never reports success for
   something that did not happen.

   To wire a real one — Formspree, Netlify Forms, Basin, your own handler —
   set ENDPOINT to its URL. The submit path switches automatically and the
   on-screen wording changes with it. Nothing else needs editing.

   Validation is announced, not just coloured: every message is text, tied to
   its field with aria-describedby, mirrored in aria-invalid, and the first
   failing field takes focus.

   Registers as DA.contact; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* ---- EDIT ME: set to a POST URL to enable real submission -------------- */
  var ENDPOINT = null;
  /* ----------------------------------------------------------------------- */

  var MAILTO = 'dainfotech7@gmail.com';

  /* Deliberately permissive. Over-strict email patterns reject valid
     addresses; the real check is whether a reply arrives. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[+()\d][\d\s()+.-]{5,}$/;

  var MESSAGES = {
    name: 'Please enter your name.',
    email: 'Please enter an email address we can reply to.',
    emailFormat: 'That email address does not look right.',
    phoneFormat: 'That phone number does not look right.',
    details: 'Please tell us a little about the project.',
    detailsShort: 'A sentence or two would help — at least 10 characters.'
  };

  var form = null;
  var status = null;
  var note = null;
  var submitLabel = null;

  /* ---------------------------------------------------------------------- */
  /* Field state                                                             */
  /* ---------------------------------------------------------------------- */

  function fieldOf(input) {
    return input.closest ? input.closest('.field') : null;
  }

  function setError(input, message) {
    var field = fieldOf(input);
    var error = field ? field.querySelector('[data-error-for="' + input.id + '"]') : null;

    if (message) {
      if (field) field.classList.add('has-error');
      if (error) error.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      if (field) field.classList.remove('has-error');
      if (error) error.textContent = '';
      input.removeAttribute('aria-invalid');
    }

    return !message;
  }

  /* ---------------------------------------------------------------------- */
  /* Rules                                                                   */
  /* ---------------------------------------------------------------------- */

  function validateField(input) {
    var value = (input.value || '').trim();

    switch (input.name) {
      case 'name':
        return setError(input, value ? '' : MESSAGES.name);

      case 'email':
        if (!value) return setError(input, MESSAGES.email);
        return setError(input, EMAIL.test(value) ? '' : MESSAGES.emailFormat);

      case 'phone':   /* optional, but validated when filled in */
        if (!value) return setError(input, '');
        return setError(input, PHONE.test(value) ? '' : MESSAGES.phoneFormat);

      case 'details':
        if (!value) return setError(input, MESSAGES.details);
        return setError(input, value.length >= 10 ? '' : MESSAGES.detailsShort);

      default:
        return true;
    }
  }

  function validatable() {
    return Array.prototype.slice.call(
      form.querySelectorAll('input[name], textarea[name], select[name]')
    ).filter(function (input) { return input.name !== 'website'; });
  }

  function validateAll() {
    var invalid = [];

    validatable().forEach(function (input) {
      if (!validateField(input)) invalid.push(input);
    });

    return invalid;
  }

  /* ---------------------------------------------------------------------- */
  /* Status                                                                  */
  /* ---------------------------------------------------------------------- */

  function say(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-ok', kind === 'ok');
    status.classList.toggle('is-error', kind === 'error');
    status.classList.add('is-visible');
  }

  function clearStatus() {
    if (!status) return;
    status.textContent = '';
    status.classList.remove('is-visible', 'is-ok', 'is-error');
  }

  /* ---------------------------------------------------------------------- */
  /* Submission                                                              */
  /* ---------------------------------------------------------------------- */

  function collect() {
    var data = {};
    validatable().forEach(function (input) {
      var value = (input.value || '').trim();
      if (value) data[input.name] = value;
    });
    return data;
  }

  function labelFor(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  function buildMailto(data) {
    var subject = 'Project enquiry — ' + (data.name || 'Website');
    var lines = Object.keys(data).map(function (key) {
      return labelFor(key) + ': ' + data[key];
    });

    return 'mailto:' + MAILTO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function sendToEndpoint(data) {
    form.classList.add('is-sending');
    if (submitLabel) submitLabel.textContent = 'Sending…';

    window.fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      form.reset();
      say('Thanks — your enquiry has been sent. We will reply to ' +
        (data.email || 'your email') + '.', 'ok');
    }).catch(function () {
      say('Something went wrong sending that. Please email ' + MAILTO +
        ' directly, or call +91-63537-57310.', 'error');
    }).then(function () {
      form.classList.remove('is-sending');
      if (submitLabel) submitLabel.textContent = 'Send Enquiry';
    });
  }

  /* No endpoint: hand the enquiry to the visitor's mail client and describe
     precisely what happened. The wording never implies the site sent it. */
  function openMailClient(data) {
    window.location.href = buildMailto(data);
    say('Your email app should now be open with these details filled in — ' +
      'press send there to reach us. If nothing opened, email ' + MAILTO +
      ' directly.', 'ok');
  }

  function onSubmit(event) {
    event.preventDefault();
    clearStatus();

    /* Honeypot: a bot filled a field no person can see. Fail quietly. */
    var trap = form.querySelector('[name="website"]');
    if (trap && trap.value) return;

    var invalid = validateAll();

    if (invalid.length) {
      say(invalid.length === 1
        ? 'One field needs attention before this can be sent.'
        : invalid.length + ' fields need attention before this can be sent.', 'error');
      invalid[0].focus();
      return;
    }

    var data = collect();
    if (ENDPOINT) sendToEndpoint(data);
    else openMailClient(data);
  }

  /* ---------------------------------------------------------------------- */
  /* Init                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    form = document.querySelector('[data-contact-form]');
    if (!form) return;

    status = form.querySelector('[data-form-status]');
    note = form.querySelector('[data-form-note]');
    submitLabel = form.querySelector('[data-submit-label]');

    /* Say up front how this form behaves, rather than after a click. */
    if (note) {
      note.textContent = ENDPOINT
        ? 'We usually reply by email.'
        : 'This opens your email app with the details filled in.';
    }

    form.addEventListener('submit', onSubmit);

    validatable().forEach(function (input) {
      /* Validate on blur, but once a field is already flagged, correct it
         live — leaving an error up while it is being fixed is just noise. */
      input.addEventListener('blur', function () { validateField(input); });

      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('has-error')) validateField(input);
      });
    });
  }

  DA.contact = {
    init: init,
    validate: function () { return validateAll().length === 0; },
    hasBackend: function () { return !!ENDPOINT; }
  };

})(window, document);
