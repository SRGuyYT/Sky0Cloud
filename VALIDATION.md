# Validation

## Automated checks

- `bash -n scripts/*.sh`
- `docker compose config`
- `scripts/ensure-config.sh` executed against persistent `/data` volume

## Manual validation checklist

1. Run `bash scripts/install.sh`.
2. Confirm `docker compose ps` reports healthy services.
3. Open `https://sky0cloud.dpdns.org` and verify Element UI loads.
4. Open `https://sky0cloud.dpdns.org/welcome.html` and verify theme toggle + login/register actions.
5. Open `https://sky0cloud.dpdns.org/config.sky0cloud.dpdns.org.json` and verify JSON response.
6. Restart backend container and confirm config alias still exists:
   - `docker compose restart conduwuit`
   - `curl -fsSL https://sky0cloud.dpdns.org/config.sky0cloud.dpdns.org.json`
