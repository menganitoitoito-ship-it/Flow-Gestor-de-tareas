#!/bin/bash
# Flow Hub — servidor local para probar PWA
# Abre http://localhost:8080 en el navegador

PORT=${1:-8080}
echo "Flow Hub → http://localhost:$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
