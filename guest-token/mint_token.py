from flask import Flask, jsonify, request, abort
import os
import time
import requests
from collections import defaultdict, deque

app = Flask(__name__)

HOMESERVER = os.environ.get('HOMESERVER', 'https://sky0cloud.dpdns.org').rstrip('/')
ADMIN_SECRET = os.environ.get('ADMIN_SECRET', 'change-me')
PUBLIC_MINT = os.environ.get('PUBLIC_MINT', 'false').lower() == 'true'
SHARED_GUEST_USER = os.environ.get('SHARED_GUEST_USER', '')
SHARED_GUEST_PASSWORD = os.environ.get('SHARED_GUEST_PASSWORD', '')
TIMEOUT_S = int(os.environ.get('MINT_TIMEOUT_S', '12'))
RATE_LIMIT_PER_MIN = int(os.environ.get('MINT_RATE_LIMIT_PER_MIN', '15'))

_request_times = defaultdict(deque)


def _client_ip() -> str:
    forwarded = request.headers.get('X-Forwarded-For', '').split(',')[0].strip()
    return forwarded or (request.remote_addr or 'unknown')


def _rate_limit_check() -> bool:
    now = time.time()
    ip = _client_ip()
    window = _request_times[ip]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= RATE_LIMIT_PER_MIN:
        return False
    window.append(now)
    return True


def _mint_guest_via_register() -> dict | None:
    payload = {'kind': 'guest', 'inhibit_login': False}
    endpoints = [
        f'{HOMESERVER}/_matrix/client/v3/register?kind=guest',
        f'{HOMESERVER}/_matrix/client/r0/register?kind=guest'
    ]

    for endpoint in endpoints:
        try:
            res = requests.post(endpoint, json=payload, timeout=TIMEOUT_S)
            if res.status_code != 200:
                continue
            data = res.json()
            if data.get('access_token'):
                return {
                    'access_token': data.get('access_token'),
                    'user_id': data.get('user_id', ''),
                    'device_id': data.get('device_id', ''),
                    'mode': 'guest_register',
                    'expires_at': int(time.time()) + 60 * 60 * 6,
                }
        except Exception:
            continue
    return None


def _mint_guest_via_shared_login() -> dict | None:
    if not SHARED_GUEST_USER or not SHARED_GUEST_PASSWORD:
        return None

    payloads = [
        {'type': 'm.login.password', 'user': SHARED_GUEST_USER, 'password': SHARED_GUEST_PASSWORD},
        {
            'type': 'm.login.password',
            'identifier': {'type': 'm.id.user', 'user': SHARED_GUEST_USER},
            'password': SHARED_GUEST_PASSWORD,
        },
    ]
    endpoints = [
        f'{HOMESERVER}/_matrix/client/v3/login',
        f'{HOMESERVER}/_matrix/client/r0/login',
    ]

    for endpoint in endpoints:
        for payload in payloads:
            try:
                res = requests.post(endpoint, json=payload, timeout=TIMEOUT_S)
                if res.status_code != 200:
                    continue
                data = res.json()
                if data.get('access_token'):
                    return {
                        'access_token': data.get('access_token'),
                        'user_id': data.get('user_id', ''),
                        'device_id': data.get('device_id', ''),
                        'mode': 'shared_guest_login',
                        'expires_at': int(time.time()) + 60 * 60 * 6,
                    }
            except Exception:
                continue
    return None


def _mint_guest() -> dict | None:
    return _mint_guest_via_register() or _mint_guest_via_shared_login()


@app.after_request
def _set_headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Pragma'] = 'no-cache'
    return response


@app.route('/mint-guest', methods=['GET', 'POST'])
def mint_guest():
    if not _rate_limit_check():
        return jsonify({'error': 'rate_limited'}), 429

    if request.method == 'POST':
        secret = request.headers.get('X-Admin-Secret', '')
        if secret != ADMIN_SECRET:
            abort(403)
    elif not PUBLIC_MINT:
        abort(403)

    session = _mint_guest()
    if not session:
        return jsonify({'error': 'guest_mint_failed'}), 503
    return jsonify(session)


@app.route('/healthz', methods=['GET'])
def healthz():
    return jsonify({'ok': True, 'public_mint': PUBLIC_MINT})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
