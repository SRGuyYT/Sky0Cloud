(() => {
  'use strict';

  const qs = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  function hasExistingSession() {
    try {
      return Boolean(localStorage.getItem('mx_access_token'));
    } catch (error) {
      console.warn('[welcome] Unable to inspect session storage.', error);
      return false;
    }
  }

  function redirectLoggedInUser() {
    if (!hasExistingSession()) return;
    window.location.replace('/#/home');
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            installing.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!window.__sky0cloudSwRefreshed) {
          window.__sky0cloudSwRefreshed = true;
          window.location.reload();
        }
      });

      const unreadCount = Number(localStorage.getItem('mx_unread_notifications') || '0');
      if (navigator.serviceWorker.controller && Number.isFinite(unreadCount)) {
        navigator.serviceWorker.controller.postMessage({ type: 'SET_BADGE', count: Math.max(0, unreadCount) });
      }
    } catch (error) {
      console.warn('[welcome] Service worker registration failed.', error);
    }
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
    void registerServiceWorker();
    enableLanguagePickerDocking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
