// welcome.js
(() => {
  'use strict';

  const CONFIG = {
    TOKEN_ENDPOINT: 'https://sky0cloud.dpdns.org/guest-token-api/get-token',
    LOGIN_WITH_TOKEN_BASE: 'https://sky0cloud.dpdns.org/#/login?token=',
    TIMEOUT_MS: 12000
  };

  function $(id) { return document.getElementById(id); }

  async function fetchWithTimeout(url, options = {}, timeout = CONFIG.TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function dockLanguagePicker() {
    const slot = $('languagePickerSlot');
    if (!slot) return false;

    const picker =
      document.querySelector('.mx_LanguagePicker') ||
      document.querySelector('.mx_LanguageDropdown') ||
      document.querySelector('[data-testid="language-picker"]');

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

    setTimeout(() => {
      observer.disconnect();
      dockLanguagePicker();
    }, 10000);
  }

  function setBusy(guestBtn, guestLabel, guestSpinner, isBusy) {
    guestBtn.disabled = isBusy;
    guestLabel.textContent = isBusy ? 'Connecting...' : 'Enter Guest Mode';
    guestSpinner.style.display = isBusy ? 'inline-block' : 'none';
  }

  function showError(errEl, message) {
    errEl.textContent = message;
    errEl.style.display = 'block';
  }

  function clearError(errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }

  function extractToken(payload) {
    if (!payload || typeof payload !== 'object') return '';
    return payload.token || payload.access_token || payload.login_token || '';
  }

  function redirectParentWithToken(token) {
    const redirectUrl = CONFIG.LOGIN_WITH_TOKEN_BASE + encodeURIComponent(token);
    console.log('[welcome] Redirecting parent to:', redirectUrl);
    window.parent.location.href = redirectUrl;
  }

  async function getGuestToken() {
    console.log('[welcome] Starting guest token fetch:', CONFIG.TOKEN_ENDPOINT);
    const res = await fetchWithTimeout(CONFIG.TOKEN_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }, CONFIG.TIMEOUT_MS);

    console.log('[welcome] Guest token response status:', res.status);
    if (!res.ok) {
      const text = await res.text().catch(() => '<no body>');
      throw new Error('Token endpoint failed: ' + res.status + ' ' + text);
    }

    const json = await res.json();
    console.log('[welcome] Guest token response payload:', json);
    const token = extractToken(json);
    if (!token) {
      throw new Error('Token field missing in response payload.');
    }

    console.log('[welcome] Guest token received.');
    return token;
  }

  function attachHandlers() {
    const guestBtn = $('guestBtn');
    const guestLabel = $('guestLabel');
    const guestSpinner = $('guestSpinner');
    const errEl = $('err');

    if (!guestBtn || !guestLabel || !guestSpinner || !errEl) {
      console.error('[welcome] Missing required DOM nodes for guest flow.');
      return;
    }

    guestBtn.addEventListener('click', async () => {
      console.log('[welcome] Guest Mode clicked.');
      clearError(errEl);
      setBusy(guestBtn, guestLabel, guestSpinner, true);

      try {
        const token = await getGuestToken();
        console.log('[welcome] Attempting redirect with guest token.');
        redirectParentWithToken(token);
      } catch (err) {
        console.log('[welcome] Guest login flow failed:', err);
        showError(errEl, 'Guest login failed. Please try again.');
      } finally {
        setBusy(guestBtn, guestLabel, guestSpinner, false);
      }
    });

    guestBtn.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') guestBtn.click();
    });
  }

  function init() {
    attachHandlers();
    enableLanguagePickerDocking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
