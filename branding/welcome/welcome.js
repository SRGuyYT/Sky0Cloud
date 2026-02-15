// welcome.js
(() => {
  'use strict';

  const CONFIG = {
    matrixBase: 'https://sky0cloud.dpdns.org',
    mintGuestEndpoint: '/mint-guest',
    loginRouteBase: 'https://sky0cloud.dpdns.org/#/login',
    timeoutMs: 12000,
    autoLoginDelayMs: 350,
    storageKey: 'sky0cloud.guest.session.v1'
  };

  const qs = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  async function fetchWithTimeout(url, options = {}, timeout = CONFIG.timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal, credentials: 'omit' });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function setStatus(message) {
    const status = byId('status');
    if (status) status.textContent = message;
    console.log('[welcome]', message);
  }

  function showError(message) {
    const errEl = byId('err');
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
    setStatus('Guest auto-login unavailable. You can use Login or Sign up.');
  }

  function clearError() {
    const errEl = byId('err');
    if (errEl) {
      errEl.textContent = '';
      errEl.style.display = 'none';
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
    if (picker.parentElement === slot) return true;

    slot.appendChild(picker);
    console.log('[welcome] Language picker moved to dock.');
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

  function normalizeSession(input) {
    if (!input || typeof input !== 'object') return null;
    const accessToken = input.access_token || input.token || '';
    const userId = input.user_id || '';
    const deviceId = input.device_id || '';
    if (!accessToken) return null;
    return {
      access_token: accessToken,
      user_id: userId,
      device_id: deviceId,
      created_at: Date.now()
    };
  }

  function persistSession(session) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(session));
      console.log('[welcome] Guest session persisted in localStorage.');
    } catch (err) {
      console.warn('[welcome] Failed to persist guest session.', err);
    }
  }

  function buildLoginUrl(session) {
    const params = new URLSearchParams({
      token: session.access_token,
      guest: '1'
    });
    if (session.user_id) params.set('user_id', session.user_id);
    if (session.device_id) params.set('device_id', session.device_id);
    return `${CONFIG.loginRouteBase}?${params.toString()}`;
  }

  function redirectToElement(url) {
    console.log('[welcome] Redirecting to:', url);
    try {
      window.parent.location.href = url;
      return;
    } catch (err) {
      console.warn('[welcome] parent.location redirect blocked, falling back to native link.', err);
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_parent';
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => link.remove(), 0);
  }

  async function mintGuestViaMatrix() {
    setStatus('Requesting Matrix guest registration...');
    const payload = { kind: 'guest', inhibit_login: false };
    const endpoints = [
      `${CONFIG.matrixBase}/_matrix/client/v3/register?kind=guest`,
      `${CONFIG.matrixBase}/_matrix/client/r0/register?kind=guest`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log('[welcome] Matrix guest attempt:', endpoint, payload);
        const res = await fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        if (!res.ok) {
          console.warn('[welcome] Matrix guest registration failed:', res.status, text);
          continue;
        }

        const data = JSON.parse(text);
        const session = normalizeSession(data);
        if (session) {
          setStatus('Guest account created. Redirecting...');
          return session;
        }
      } catch (err) {
        console.warn('[welcome] Matrix guest registration exception:', err);
      }
    }

    return null;
  }

  async function mintGuestViaService() {
    setStatus('Requesting guest token from mint service...');
    const res = await fetchWithTimeout(CONFIG.mintGuestEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Mint service failed (${res.status}): ${text}`);
    }

    const data = JSON.parse(text);
    const session = normalizeSession(data);
    if (!session) {
      throw new Error('Mint service response is missing access_token/token.');
    }

    return session;
  }

  async function runGuestAutoLogin({ manual = false } = {}) {
    const guestBtn = byId('guestBtn');
    const guestLabel = byId('guestLabel');
    const guestSpinner = byId('guestSpinner');

    if (guestBtn && guestLabel && guestSpinner) {
      guestBtn.disabled = true;
      guestLabel.textContent = manual ? 'Connecting...' : 'Auto connecting...';
      guestSpinner.style.display = 'inline-block';
    }

    clearError();

    try {
      const matrixSession = await mintGuestViaMatrix();
      const session = matrixSession || await mintGuestViaService();
      persistSession(session);
      redirectToElement(buildLoginUrl(session));
    } catch (err) {
      console.error('[welcome] Auto guest login failed.', err);
      showError('Unable to start guest session right now. Please use Login or Sign up.');
    } finally {
      if (guestBtn && guestLabel && guestSpinner) {
        guestBtn.disabled = false;
        guestLabel.textContent = 'Enter Guest Mode';
        guestSpinner.style.display = 'none';
      }
    }
  }

  function attachHandlers() {
    const guestBtn = byId('guestBtn');
    if (guestBtn) {
      guestBtn.addEventListener('click', () => runGuestAutoLogin({ manual: true }));
    }
  }

  function init() {
    attachHandlers();
    enableLanguagePickerDocking();
    setStatus('Starting guest auto-login...');
    setTimeout(() => runGuestAutoLogin({ manual: false }), CONFIG.autoLoginDelayMs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
