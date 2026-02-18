(() => {
  'use strict';

  const qs = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  function hasExistingSession() {
    try {
      const token = localStorage.getItem('mx_access_token');
      const userId = localStorage.getItem('mx_user_id');
      return Boolean(token && userId);
    } catch (error) {
      console.warn('[welcome] Unable to read localStorage for session check.', error);
      return false;
    }
  }

  function redirectLoggedInUser() {
    if (!hasExistingSession()) return;
    window.location.replace('/#/home');
  }

  function dockLanguagePicker() {
    const slot = byId('languagePickerSlot');
    if (!slot) return false;

    const picker =
      qs('.mx_LanguagePicker') ||
      qs('.mx_LanguageDropdown') ||
      qs('[data-testid="language-picker"]');

    if (!picker) return false;
    if (picker.parentElement !== slot) {
      slot.appendChild(picker);
    }

    return true;
  }

  function enableLanguagePickerDocking() {
    if (dockLanguagePicker()) return;

    const observer = new MutationObserver(() => {
      if (dockLanguagePicker()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  function init() {
    redirectLoggedInUser();
    enableLanguagePickerDocking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
