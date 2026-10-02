/* Mobilní menu (hamburger) a rozbalovací podmenu – myš, dotyk i klávesnice. */
(function () {
  var MOBILE = window.matchMedia('(max-width: 900px)');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hlavni-menu');
  if (!toggle || !nav) return;

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    nav.classList.toggle('nav--open', open);
    document.body.classList.toggle('nav-is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  var subItems = nav.querySelectorAll('.nav__item--has-sub');

  function setSub(item, open) {
    var btn = item.querySelector('.nav__subtoggle');
    item.classList.toggle('nav__item--open', open);
    item.classList.remove('nav__item--closed');
    btn.setAttribute('aria-expanded', String(open));
  }

  subItems.forEach(function (item) {
    var btn = item.querySelector('.nav__subtoggle');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !item.classList.contains('nav__item--open');
      if (!MOBILE.matches) subItems.forEach(function (other) { if (other !== item) setSub(other, false); });
      setSub(item, open);
    });
    // Desktop: po odjetí myší / odchodu focusu zrušit ruční zavření
    item.addEventListener('mouseleave', function () { item.classList.remove('nav__item--closed'); });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove('nav__item--closed');
        if (!MOBILE.matches) setSub(item, false);
      }
    });
  });

  // Klik mimo menu zavře podmenu (desktop, dotykové notebooky)
  document.addEventListener('click', function (e) {
    if (MOBILE.matches) return;
    subItems.forEach(function (item) { if (!item.contains(e.target)) setSub(item, false); });
  });

  // Esc zavře podmenu nebo celé mobilní menu
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openItem = nav.querySelector('.nav__item--open, .nav__item--has-sub:focus-within');
    if (openItem && !MOBILE.matches) {
      setSub(openItem, false);
      openItem.classList.add('nav__item--closed');
      openItem.querySelector('.nav__subtoggle').focus();
    } else if (nav.classList.contains('nav--open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Klik na odkaz s kotvou v mobilním menu menu zavře
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a') && MOBILE.matches) setMenu(false);
  });

  MOBILE.addEventListener('change', function () {
    setMenu(false);
    subItems.forEach(function (item) { setSub(item, false); });
  });
})();
