(() => {
  'use strict';

  function hasSession() {
    try {
      return Boolean(localStorage.getItem('mx_access_token'));
    } catch (_) {
      return false;
    }
  }

  function redirectIfLoggedIn() {
    if (hasSession()) {
      window.location.replace('/#/home');
    }
  }

  function setDailyBackground() {
    const bg = document.getElementById('bg');
    if (!bg) return;

    const now = new Date();
    const seed = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
    bg.style.backgroundImage = `url('https://picsum.photos/seed/sky0cloud-${seed}/1920/1080')`;
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });
    } catch (_) {
      // keep UI functional even if SW is unavailable.
    }
  }

  function init() {
    redirectIfLoggedIn();
    setDailyBackground();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    redirectLoggedInUser();
    initLanguage();
    initRefreshPermissionButton();
    void registerServiceWorker();
  }
})();