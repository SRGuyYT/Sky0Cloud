// welcome.js
(() => {
  'use strict';

  const CONFIG = {
    MATRIX_BASE: 'https://sky0cloud.dpdns.org',
    TOKEN_ENDPOINT: '', // optional external guest token mint endpoint
    GUEST_USER: 'guest',
    GUEST_PASSWORD: '', // optional fallback password login for a fixed guest account
    TIMEOUT_MS: 12000
  };

  function $(id) { return document.getElementById(id); }

  async function fetchWithTimeout(url, options = {}, timeout = CONFIG.TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  function buildElementGuestUrl(tokenResponse) {
    const params = new URLSearchParams();
    if (tokenResponse.login_token) {
      params.set('loginToken', tokenResponse.login_token);
    } else if (tokenResponse.access_token) {
      // Some Matrix guest flows return access_token directly; keep as fallback.
      params.set('access_token', tokenResponse.access_token);
    }

    if (tokenResponse.user_id) params.set('user_id', tokenResponse.user_id);
    if (tokenResponse.device_id) params.set('device_id', tokenResponse.device_id);

    return CONFIG.MATRIX_BASE.replace(/\/+$/, '') + '/#/?' + params.toString();
  }

  function redirectViaNativeAnchor(url) {
    console.log('[welcome] Attempting redirect via native anchor click:', url);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_parent';
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => link.remove(), 0);
  }

  async function mintGuestTokenFromService() {
    if (!CONFIG.TOKEN_ENDPOINT) {
      console.log('[welcome] TOKEN_ENDPOINT is not configured; skipping token-service flow.');
      return null;
    }

    console.log('[welcome] Starting token-service fetch:', CONFIG.TOKEN_ENDPOINT);
    const res = await fetchWithTimeout(CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, CONFIG.TIMEOUT_MS);

    console.log('[welcome] Token-service response status:', res.status);
    if (!res.ok) {
      const text = await res.text().catch(() => '<no body>');
      throw new Error('Token service failed: ' + res.status + ' ' + text);
    }

    const json = await res.json();
    console.log('[welcome] Token-service payload received:', json);
    return json;
  }

  async function mintGuestTokenFromMatrix() {
    const base = CONFIG.MATRIX_BASE.replace(/\/+$/, '');
    const attempts = [
      {
        url: base + '/_matrix/client/v3/register',
        payload: { kind: 'guest' },
        label: 'v3 guest register'
      },
      {
        url: base + '/_matrix/client/r0/register',
        payload: { kind: 'guest' },
        label: 'r0 guest register'
      }
    ];

    if (CONFIG.GUEST_PASSWORD) {
      attempts.push(
        {
          url: base + '/_matrix/client/v3/login',
          payload: { type: 'm.login.password', user: CONFIG.GUEST_USER, password: CONFIG.GUEST_PASSWORD },
          label: 'v3 password login (fallback)'
        },
        {
          url: base + '/_matrix/client/r0/login',
          payload: { type: 'm.login.password', user: CONFIG.GUEST_USER, password: CONFIG.GUEST_PASSWORD },
          label: 'r0 password login (fallback)'
        }
      );
    }

    for (const attempt of attempts) {
      try {
        console.log('[welcome] Starting fetch:', attempt.label, attempt.url, attempt.payload);
        const res = await fetchWithTimeout(attempt.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(attempt.payload)
        }, CONFIG.TIMEOUT_MS);

        console.log('[welcome] Fetch completed:', attempt.label, 'status=', res.status);
        if (!res.ok) {
          const text = await res.text().catch(() => '<no body>');
          console.log('[welcome] Fetch non-ok response:', attempt.label, text);
          continue;
        }

        const json = await res.json().catch(() => null);
        console.log('[welcome] Fetch successful payload:', attempt.label, json);
        if (json && (json.access_token || json.login_token)) {
          console.log('[welcome] Token received from', attempt.label);
          return json;
        }

        console.log('[welcome] No usable token in response for', attempt.label);
      } catch (err) {
        console.log('[welcome] Fetch threw error for', attempt.label, err);
      }
    }

    return null;
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

  function attachHandlers() {
    const guestBtn = $('guestBtn');
    const guestLabel = $('guestLabel');
    const guestSpinner = $('guestSpinner');
    const errEl = $('err');

    if (!guestBtn || !guestLabel || !guestSpinner || !errEl) {
      console.error('[welcome] Missing required DOM nodes for guest flow.');
      return;
    } catch (err) {
      console.warn('[welcome] parent.location redirect blocked, falling back to native link.', err);
    }

    guestBtn.addEventListener('click', async () => {
      console.log('[welcome] Guest Mode clicked.');
      clearError(errEl);
      setBusy(guestBtn, guestLabel, guestSpinner, true);

      try {
        let tokenResponse = null;

        try {
          tokenResponse = await mintGuestTokenFromService();
        } catch (serviceErr) {
          console.log('[welcome] Token-service flow failed:', serviceErr);
        }

        if (!tokenResponse) {
          console.log('[welcome] Falling back to Matrix guest fetch flow.');
          tokenResponse = await mintGuestTokenFromMatrix();
        }

        if (!tokenResponse) {
          showError(errEl, 'Guest login failed. Check server config or CORS.');
          console.log('[welcome] Guest flow ended with no token.');
          return;
        }

        const redirectUrl = buildElementGuestUrl(tokenResponse);
        console.log('[welcome] Redirect URL built:', redirectUrl);
        redirectViaNativeAnchor(redirectUrl);
      } catch (err) {
        console.log('[welcome] Unexpected guest flow error:', err);
        showError(errEl, 'Guest login failed due to an unexpected error.');
      } finally {
        setBusy(guestBtn, guestLabel, guestSpinner, false);
      }
    });

    guestBtn.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') guestBtn.click();
    });
  }

    guestBtn.focus({ preventScroll: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
