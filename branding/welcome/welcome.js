(() => {
  'use strict';

  const I18N = {
    en: {
      welcome_title: 'Welcome to Sky0Cloud',
      subtitle: 'Secure Matrix messaging for your community.',
      login: 'Login',
      signup: 'Sign up',
      status: 'Registration requires an invite token.',
      element_ios: 'Element iOS',
      element_android: 'Element Android',
      fluffy_ios: 'FluffyChat iOS',
      fluffy_android: 'FluffyChat Android',
      schildi_android: 'SchildiChat Android',
      refresh_perm: 'Enable Background Refresh',
      refresh_note: 'Enable notifications for better background refresh behavior on iOS PWA.'
    },
    es: {
      welcome_title: 'Bienvenido a Sky0Cloud',
      subtitle: 'Mensajería Matrix segura para tu comunidad.',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      status: 'El registro requiere un token de invitación.',
      element_ios: 'Element iOS',
      element_android: 'Element Android',
      fluffy_ios: 'FluffyChat iOS',
      fluffy_android: 'FluffyChat Android',
      schildi_android: 'SchildiChat Android',
      refresh_perm: 'Activar actualización en segundo plano',
      refresh_note: 'Activa notificaciones para mejorar la actualización en segundo plano en iOS PWA.'
    },
    fr: {
      welcome_title: 'Bienvenue sur Sky0Cloud',
      subtitle: 'Messagerie Matrix sécurisée pour votre communauté.',
      login: 'Connexion',
      signup: 'Inscription',
      status: 'L’inscription nécessite un jeton d’invitation.',
      element_ios: 'Element iOS',
      element_android: 'Element Android',
      fluffy_ios: 'FluffyChat iOS',
      fluffy_android: 'FluffyChat Android',
      schildi_android: 'SchildiChat Android',
      refresh_perm: 'Activer l’actualisation en arrière-plan',
      refresh_note: 'Activez les notifications pour améliorer l’actualisation en arrière-plan sur iOS PWA.'
    }
  };

  function applyLanguage(lang) {
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem('sky0cloud.lang', lang);
  }

  function initLanguage() {
    const picker = document.getElementById('langPicker');
    if (!picker) return;

    const lang = localStorage.getItem('sky0cloud.lang') || 'en';
    picker.value = lang;
    applyLanguage(lang);
    picker.addEventListener('change', () => applyLanguage(picker.value));
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            installing.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (error) {
      console.warn('[welcome] Service worker registration failed.', error);
    }
  }

  async function requestBackgroundRefreshPermission() {
    const status = document.getElementById('refreshPermStatus');

    if (!('Notification' in window)) {
      if (status) status.textContent = 'Notifications are not supported in this browser.';
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (status) {
        if (permission === 'granted') {
          status.textContent = 'Notifications enabled. iOS can use this to improve background refresh behavior.';
        } else {
          status.textContent = 'Notifications not enabled. Background refresh may be limited by iOS.';
        }
      }

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if ('periodicSync' in reg && permission === 'granted') {
          try {
            await reg.periodicSync.register('sky0cloud-refresh', { minInterval: 24 * 60 * 60 * 1000 });
          } catch (_) {
            // Optional capability, not available on all browsers.
          }
        }
      }
    } catch (error) {
      if (status) status.textContent = 'Unable to request notification permission.';
      console.warn('[welcome] Notification permission request failed.', error);
    }
  }

  function initRefreshPermissionButton() {
    const btn = document.getElementById('refreshPermBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      void requestBackgroundRefreshPermission();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLanguage();
      initRefreshPermissionButton();
      void registerServiceWorker();
    });
  } else {
    initLanguage();
    initRefreshPermissionButton();
    void registerServiceWorker();
  }
})();
