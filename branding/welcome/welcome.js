const I18N = {
    en: {
      lang: 'Language',
      title: 'Welcome to Sky0Cloud',
      subtitle: 'Messaging for the communities.',
      login: 'Login',
      signup: 'Sign up',
      token: "Registration requires an invite token. (it's in your email or i told you)"
    },
    es: {
      lang: 'Idioma',
      title: 'Bienvenido a Sky0Cloud',
      subtitle: 'Mensajería para las comunidades.',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      token: 'El registro requiere un token de invitación. (está en tu correo o te lo dije)'
    },
    fr: {
      lang: 'Langue',
      title: 'Bienvenue sur Sky0Cloud',
      subtitle: 'Messagerie pour les communautés.',
      login: 'Connexion',
      signup: 'Inscription',
      token: "L'inscription nécessite un jeton d'invitation. (c'est dans votre e-mail ou je vous l'ai dit)"
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
    const langLabel = byId('langLabel');
    const welcomeTitle = byId('welcome-title');
    const welcomeSub = byId('welcomeSub');
    const loginLink = byId('loginLink');
    const signupLink = byId('signupLink');
    const tokenHint = byId('tokenHint');

    if (langLabel) langLabel.textContent = t.lang;
    if (welcomeTitle) welcomeTitle.textContent = t.title;
    if (welcomeSub) welcomeSub.textContent = t.subtitle;
    if (loginLink) loginLink.textContent = t.login;
    if (signupLink) signupLink.textContent = t.signup;
    if (tokenHint) tokenHint.textContent = t.token;

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