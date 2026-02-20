(() => {
  'use strict';

  const I18N = {
    en: {
      title: 'Sky0Cloud v4',
      subtitle: 'Messaging built for your life.',
      create_account: 'Create an Account',
      login: 'Already have an account? Login',
      status: 'Registration requires invite token: check your email'
    },
    es: {
      title: 'Sky0Cloud v4',
      subtitle: 'Mensajería Matrix segura y rápida para tu red.',
      create_account: 'Crear una cuenta',
      login: '¿Ya tienes una cuenta? Iniciar sesión',
      status: 'El registro requiere token de invitación: check your email'
    },
    fr: {
      title: 'Sky0Cloud v4',
      subtitle: 'Messagerie Matrix sécurisée et rapide pour votre réseau.',
      create_account: 'Créer un compte',
      login: 'Vous avez déjà un compte ? Connexion',
      status: 'Inscription avec jeton requis : check your email'
    }
  };

  function hasExistingSession() {
    try {
      return Boolean(localStorage.getItem('mx_access_token'));
    } catch (_) {
      return false;
    }
  }

  function redirectLoggedInUser() {
    if (!hasExistingSession()) return;
    window.location.replace('/#/home');
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
      // ignore storage errors
    }
  }

  function initLanguageSwitcher() {
    const picker = document.getElementById('langPicker');
    if (!picker) return;

    const lang = (() => {
      try {
        return localStorage.getItem('sky0cloud.lang') || 'en';
      } catch (_) {
        return 'en';
      }
    })();

    picker.value = lang;
    applyLanguage(lang);
    picker.addEventListener('change', () => applyLanguage(picker.value));
  }

  function loadDynamicBackground() {
    const bg = document.getElementById('bg');
    if (!bg) return;

    const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const url = `https://picsum.photos/seed/${seed}/1920/1080`;
    bg.style.backgroundImage = `url('${url}')`;
  }

  function init() {
    redirectLoggedInUser();
    initLanguageSwitcher();
    loadDynamicBackground();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      redirectLoggedInUser();
      initLanguage();
      initRefreshPermissionButton();
      void registerServiceWorker();
    });
  } else {
    redirectLoggedInUser();
    initLanguage();
    initRefreshPermissionButton();
    void registerServiceWorker();
  }
})();