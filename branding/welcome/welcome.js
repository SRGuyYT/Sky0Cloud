(() => {
  'use strict';

  const SW_URL = '/sw.js';
  const STATUS_READY = 'Registration requires an invite token.';

  const qs = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  function setStatus(message) {
    const status = byId('status');
    if (status) status.textContent = message;
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
      if (dockLanguagePicker()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  async function updateAppBadge(count) {
    if (!('setAppBadge' in navigator) || !('clearAppBadge' in navigator)) return;
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (error) {
      console.warn('[welcome] App badge update failed.', error);
    }
  }

  function readUnreadCount(payload) {
    const candidates = [
      payload?.unread,
      payload?.counts?.unread,
      payload?.counts?.notifications,
      payload?.notification_count,
      payload?.notification?.counts?.unread,
    ];

    for (const value of candidates) {
      const number = Number(value);
      if (!Number.isNaN(number) && Number.isFinite(number) && number >= 0) {
        return Math.floor(number);
      }
    }

    return null;
  }

  function bindServiceWorkerMessages() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const message = event.data || {};
      if (message.type !== 'SYNC_BADGE') return;
      const unread = readUnreadCount(message.payload || {});
      if (unread !== null) {
        updateAppBadge(unread);
      }
    });
  }

  function enableImmediateUpdates(registration) {
    if (!registration) return;

    const sendSkipWaiting = (worker) => {
      if (!worker) return;
      worker.postMessage({ type: 'SKIP_WAITING' });
    };

    if (registration.waiting) {
      sendSkipWaiting(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;

      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') {
          sendSkipWaiting(worker);
        }
      });
    });
  }

  async function initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      setStatus(STATUS_READY);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' });
      bindServiceWorkerMessages();
      enableImmediateUpdates(registration);

      if (registration.active) {
        registration.active.postMessage({ type: 'PING' });
      }

      await updateAppBadge(0);
      setStatus(STATUS_READY);
    } catch (error) {
      console.error('[welcome] Service worker registration failed.', error);
      setStatus('Welcome loaded. Notifications may be limited until the app is refreshed.');
    }
  }

  function init() {
    enableLanguagePickerDocking();
    void initServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
