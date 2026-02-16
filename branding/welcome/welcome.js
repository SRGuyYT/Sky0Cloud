// welcome.js
(() => {
  'use strict';

  const qs = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);

  function dockLanguagePicker() {
    const slot = byId('languagePickerSlot');
    if (!slot) return false;

    const picker =
      qs('.mx_LanguagePicker') ||
      qs('.mx_LanguageDropdown') ||
      qs('[data-testid="language-picker"]');

    if (!picker) return false;
    if (picker.parentElement === slot) return true;

    slot.appendChild(picker);
    return true;
  }

  function enableLanguagePickerDocking() {
    if (dockLanguagePicker()) return;

    const observer = new MutationObserver(() => {
      if (dockLanguagePicker()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  function init() {
    enableLanguagePickerDocking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
