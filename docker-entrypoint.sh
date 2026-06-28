#!/bin/sh

mkdir -p /usr/local/apache2/htdocs/config

cat <<EOF > /usr/local/apache2/htdocs/config/config.json
{
  "server": {
    "url": "${GAME_SERVER_URL}",
    "port": "${GAME_SERVER_PORT}",
    "apiBasePath": "${GAME_SERVER_API_BASE_PATH}",
    "socketBasePath": "${GAME_SERVER_SOCKET_BASE_PATH}",
    "protocols": {
      "http": "${GAME_SERVER_HTTP_PROTOCOL}",
      "ws": "${GAME_SERVER_WS_PROTOCOL}"
    }
  }
}
EOF

exec "$@"