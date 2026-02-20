(() => {
  'use strict';

  const I18N = {
    en: {
      title: 'Sky0Cloud v4',
      subtitle: 'Secure, instant Matrix messaging that just works.',
      signup: 'Create an Account',
      login: 'Already have an account? Login',
      note: 'Registration requires invite token: only_us',
    },
    es: {
      title: 'Sky0Cloud v4',
      subtitle: 'Mensajería Matrix segura e instantánea que funciona.',
      signup: 'Crear una cuenta',
      login: '¿Ya tienes una cuenta? Iniciar sesión',
      note: 'El registro requiere token de invitación: only_us',
    },
    fr: {
      title: 'Sky0Cloud v4',
      subtitle: 'Messagerie Matrix sécurisée et instantanée.',
      signup: 'Créer un compte',
      login: 'Vous avez déjà un compte ? Connexion',
      note: 'Inscription avec jeton requise : only_us',
    },
  };

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

  function applyLanguage(lang) {
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    try {
      localStorage.setItem('sky0cloud.lang', lang);
    } catch (_) {
      // no-op
    }
  }

  function initLanguage() {
    const picker = document.getElementById('langPicker');
    if (!picker) return;

    let lang = 'en';
    try {
      lang = localStorage.getItem('sky0cloud.lang') || 'en';
    } catch (_) {
      lang = 'en';
    }

    picker.value = lang;
    applyLanguage(lang);
    picker.addEventListener('change', () => applyLanguage(picker.value));
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
        // Keep startup deterministic after SW updates.
        window.location.reload();
      }, { once: true });
    } catch (_) {
      // keep UI functional even if SW is unavailable.
    }
  }

  function init() {
    redirectIfLoggedIn();
    initLanguage();
    setDailyBackground();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
