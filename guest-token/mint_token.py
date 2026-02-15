from flask import Flask, jsonify, request, abort
import requests, os, time

app = Flask(__name__)
HOMESERVER = os.environ.get('HOMESERVER', 'https://sky0cloud.dpdns.org')
REG_TOKEN = os.environ.get('REG_TOKEN', '')

@app.route('/mint-guest', methods=['POST'])
def mint_guest():
    secret = request.headers.get('X-Admin-Secret')
    if secret != os.environ.get('ADMIN_SECRET', 'change-me'):
        abort(403)
    payload = {"kind": "guest"}
    headers = {'Content-Type': 'application/json'}
    if REG_TOKEN:
        headers['Authorization'] = f'Bearer {REG_TOKEN}'
    r = requests.post(f'{HOMESERVER}/_matrix/client/v3/register?kind=guest', json=payload, headers=headers, timeout=10)
    if r.status_code != 200:
        return jsonify({"error": "failed", "status": r.status_code, "body": r.text}), 500
    data = r.json()
    return jsonify({
        "access_token": data.get('access_token'),
        "user_id": data.get('user_id'),
        "device_id": data.get('device_id'),
        "expires_at": int(time.time()) + 300
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
