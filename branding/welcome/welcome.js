(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);

  const I18N = {
    en: {
      lang: 'Language',
      title: 'Welcome to Sky0Cloud',
      subtitle: 'Secure Matrix messaging for your community.',
      login: 'Login',
      signup: 'Sign up',
      token: 'Registration requires an invite token.'
    },
    es: {
      lang: 'Idioma',
      title: 'Bienvenido a Sky0Cloud',
      subtitle: 'Mensajería Matrix segura para tu comunidad.',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      token: 'El registro requiere un token de invitación.'
    },
    fr: {
      lang: 'Langue',
      title: 'Bienvenue sur Sky0Cloud',
      subtitle: 'Messagerie Matrix sécurisée pour votre communauté.',
      login: 'Connexion',
      signup: 'Inscription',
      token: "L'inscription nécessite un jeton d'invitation."
    }
  };

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

  function applyLanguage(lang) {
    const t = I18N[lang] || I18N.en;
    byId('langLabel').textContent = t.lang;
    byId('welcome-title').textContent = t.title;
    byId('welcomeSub').textContent = t.subtitle;
    byId('loginLink').textContent = t.login;
    byId('signupLink').textContent = t.signup;
    byId('tokenHint').textContent = t.token;

    try {
      localStorage.setItem('sky0cloud.lang', lang);
    } catch (_) {}
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js?v=2', { scope: '/' });

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
    } catch (error) {
      console.warn('[welcome] Service worker registration failed.', error);
    }
  }

  function initLanguageDropdown() {
    const langSelect = byId('langSelect');
    if (!langSelect) return;

    const storedLang = (() => {
      try {
        return localStorage.getItem('sky0cloud.lang') || 'en';
      } catch (_) {
        return 'en';
      }
    })();

    langSelect.value = storedLang;
    applyLanguage(storedLang);
    langSelect.addEventListener('change', () => applyLanguage(langSelect.value));
  }

  function init() {
    redirectLoggedInUser();
    initLanguageDropdown();
    void registerServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
