/* Odeslání rezervačního formuláře přes FormSubmit (https://formsubmit.co) – bez vlastního serveru a bez účtu.
   Žádosti chodí e-mailem na adresu níže. Při úplně prvním odeslání přijde na tuto adresu
   e-mail „Confirm your email“ – je potřeba jednou kliknout na Activate Form, pak už chodí vše.
   Změna adresy = přepsat e-mail na konci FORM_ENDPOINT (a znovu aktivovat). */
var FORM_ENDPOINT = 'https://formsubmit.co/ajax/galinajork@gmail.com';

(function () {
  var form = document.getElementById('rezervace-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  // Datum nejdřív dnes
  var dateInput = form.querySelector('#termin');
  if (dateInput) {
    var t = new Date();
    dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  // Předvyplnění služby z odkazu ?sluzba=...
  var preset = new URLSearchParams(location.search).get('sluzba');
  if (preset) {
    var sel = form.querySelector('#sluzba');
    Array.prototype.forEach.call(sel.options, function (o) { if (o.value === preset) sel.value = preset; });
  }

  var messages = {
    jmeno: 'Vyplňte prosím jméno a příjmení.',
    telefon: 'Vyplňte prosím telefon, ať vám můžeme termín potvrdit.',
    email: 'Zadejte prosím platný e-mail (např. jana@email.cz).',
    sluzba: 'Vyberte prosím službu.'
  };

  function showError(field, msg) {
    var err = document.getElementById(field.id + '-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg || '';
  }

  function validate(field) {
    if (!messages[field.name]) return true;
    var ok = field.checkValidity();
    if (field.name === 'telefon' && field.value.trim()) ok = /^[+0-9 ()-]{9,}$/.test(field.value.trim());
    showError(field, ok ? '' : messages[field.name]);
    return ok;
  }

  form.addEventListener('blur', function (e) {
    if (e.target.matches('input, select, textarea') && e.target.value) validate(e.target);
  }, true);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var firstInvalid = null;
    Array.prototype.forEach.call(form.elements, function (f) {
      if (f.name && !validate(f) && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('[') === 0) {
      status.className = 'form-status form-status--err';
      status.textContent = 'Online objednávání zatím není zapojené (chybí adresa formuláře). Zavolejte nám prosím – kontakt najdete vpravo.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Odesílám…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    }).then(function (data) {
      if (String(data.success) !== 'true') throw new Error(data.message || 'FormSubmit');
      form.reset();
      status.className = 'form-status form-status--ok';
      status.textContent = 'Děkujeme, žádost o rezervaci jsme přijali. Ozveme se vám co nejdříve a termín potvrdíme.';
    }).catch(function () {
      status.className = 'form-status form-status--err';
      status.textContent = 'Žádost se nepodařilo odeslat. Zkuste to prosím znovu, nebo nám zavolejte.';
    }).finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Odeslat žádost o rezervaci';
      status.focus();
    });
  });
})();
