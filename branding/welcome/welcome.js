// welcome.js
(() => {
  'use strict';

  const CONFIG = {
    MATRIX_BASE: 'https://sky0cloud.dpdns.org',
    LOGIN_PAGE: 'https://sky0cloud.dpdns.org/#/login',
    REGISTER_PAGE: 'https://sky0cloud.dpdns.org/#/register',
    TOKEN_ENDPOINT: '', // set to token service URL if you run one
    GUEST_USER: 'guest',
    GUEST_PASSWORD: '', // set only if you accept embedding a password
    TIMEOUT_MS: 12000
  };

  function navigateTop(url){
    try { window.top.location.assign(url); }
    catch(e){ window.top.location.href = url; }
  }

  async function fetchWithTimeout(url, options={}, timeout=CONFIG.TIMEOUT_MS){
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), timeout);
    try {
      const res = await fetch(url, {...options, signal: controller.signal});
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  function $(id){ return document.getElementById(id); }

  async function mintGuestToken() {
    if (!CONFIG.TOKEN_ENDPOINT) return null;
    try {
      const res = await fetchWithTimeout(CONFIG.TOKEN_ENDPOINT, { method: 'POST' }, CONFIG.TIMEOUT_MS);
      if (!res.ok) throw new Error('token endpoint ' + res.status);
      const j = await res.json();
      return j && j.access_token ? j : null;
    } catch (e) {
      console.warn('Token mint failed', e);
      return null;
    }
  }

  function attachHandlers() {
    const loginBtn = $('loginBtn');
    const signupBtn = $('signupBtn');
    const guestBtn = $('guestBtn');
    const guestLabel = $('guestLabel');
    const guestSpinner = $('guestSpinner');
    const errEl = $('err');

    if (!loginBtn || !signupBtn || !guestBtn) {
      console.error('Welcome: missing buttons');
      return;
    }

    loginBtn.addEventListener('click', () => navigateTop(CONFIG.LOGIN_PAGE));
    signupBtn.addEventListener('click', () => navigateTop(CONFIG.REGISTER_PAGE));

    guestBtn.addEventListener('click', async () => {
      errEl.style.display = 'none';
      guestBtn.disabled = true;
      guestLabel.textContent = 'Connecting...';
      guestSpinner.style.display = 'inline-block';

      const tokenResponse = await mintGuestToken();
      if (tokenResponse && tokenResponse.access_token) {
        const fragment = new URLSearchParams({
          access_token: tokenResponse.access_token,
          user_id: tokenResponse.user_id || '',
          device_id: tokenResponse.device_id || ''
        }).toString();
        setTimeout(()=> navigateTop('/#/?' + fragment), 200);
        return;
      }

      if (!CONFIG.GUEST_PASSWORD) {
        errEl.textContent = 'Guest login not available. Contact admin.';
        errEl.style.display = 'block';
        guestBtn.disabled = false;
        guestLabel.textContent = 'Enter Guest Mode';
        guestSpinner.style.display = 'none';
        return;
      }

      const endpoints = ['/ _matrix/client/v3/login'.replace(' ',''), '/_matrix/client/r0/login'];
      const payloads = [
        { type: 'm.login.password', user: CONFIG.GUEST_USER, password: CONFIG.GUEST_PASSWORD },
        { type: 'm.login.password', identifier: { type: 'm.id.user', user: CONFIG.GUEST_USER }, password: CONFIG.GUEST_PASSWORD }
      ];

      let gotToken = false;
      for (const ep of endpoints) {
        const url = CONFIG.MATRIX_BASE.replace(/\/+$/,'') + ep;
        for (const payload of payloads) {
          try {
            console.info('Guest attempt', url, payload);
            const res = await fetchWithTimeout(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }, CONFIG.TIMEOUT_MS);

            if (!res) continue;
            if (!res.ok) {
              const text = await res.text().catch(()=>res.statusText||String(res.status));
              console.warn('Guest login non-ok', res.status, text);
              continue;
            }

            const data = await res.json().catch(()=>null);
            console.info('Guest login response', data);
            if (data && data.access_token) {
              gotToken = true;
              const fragment = new URLSearchParams({
                access_token: data.access_token,
                user_id: data.user_id || '',
                device_id: data.device_id || ''
              }).toString();
              setTimeout(()=> navigateTop('/#/?' + fragment), 200);
              break;
            } else {
              const msg = (data && (data.errcode || data.error)) ? (data.errcode || data.error) : 'no token';
              errEl.textContent = 'Guest login failed: ' + msg;
              errEl.style.display = 'block';
            }
          } catch (e) {
            console.warn('Guest attempt error', url, e && e.name);
          }
        }
        if (gotToken) break;
      }

      if (!gotToken && errEl.style.display === 'none') {
        errEl.textContent = 'Guest login failed. Check server or CORS.';
        errEl.style.display = 'block';
      }

      guestBtn.disabled = false;
      guestLabel.textContent = 'Enter Guest Mode';
      guestSpinner.style.display = 'none';
    });

    [loginBtn, signupBtn, guestBtn].forEach(b => {
      b.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') b.click(); });
    });

    loginBtn.focus({preventScroll:true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }

})();
