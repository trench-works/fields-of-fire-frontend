#!/bin/sh

mkdir -p /usr/local/apache2/htdocs/config

cat <<EOF > /usr/local/apache2/htdocs/config/config.json
{
  "server": {
    "url": "${GAME_SERVER_URL}",
    "port": "${GAME_SERVER_PORT}",
    "protocol": "${GAME_SERVER_PROTOCOL}"
  }
}
EOF

exec "$@"