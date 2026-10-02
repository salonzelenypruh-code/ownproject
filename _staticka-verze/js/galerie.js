/* Jednoduchý lightbox pro galerii – zavírání Esc, křížkem nebo klikem mimo fotku. */
(function () {
  var dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var img = dialog.querySelector('img');

  document.querySelectorAll('[data-full]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      img.src = btn.getAttribute('data-full');
      img.alt = btn.querySelector('img').alt;
      dialog.showModal();
    });
  });

  dialog.addEventListener('click', function (e) {
    if (e.target !== img) dialog.close();
  });
  dialog.addEventListener('close', function () { img.removeAttribute('src'); });
})();
