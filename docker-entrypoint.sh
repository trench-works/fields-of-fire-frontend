#!/bin/sh

mkdir -p /usr/local/apache2/htdocs/config

cat <<EOF > /usr/local/apache2/htdocs/config/config.json
{
  "server": {
    "url": "${GAME_SERVER_URL}",
    "port": "${GAME_SERVER_PORT}",
    "basePath": "${GAME_SERVER_BASE_PATH}",
    "protocols": {
      "http": "${GAME_SERVER_HTTP_PROTOCOL}",
      "ws": "${GAME_SERVER_WS_PROTOCOL}"
    }
  }
}
EOF

exec "$@"