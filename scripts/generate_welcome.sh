#!/usr/bin/env bash
set -euo pipefail

output_file="${1:-./welcome.html}"

cat > "$output_file" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=/#/login" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sky0Cloud</title>
  </head>
  <body>
    <p>Redirecting to login...</p>
    <script>
      window.location.replace('/#/login');
    </script>
  </body>
</html>
HTML

echo "Generated $output_file"
