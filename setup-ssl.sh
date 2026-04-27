#!/bin/bash

CERT_DIR="./frontend/nginx/certs"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "🔐 Generating self-signed SSL certificates for local development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=VisionAttend/OU=Dev/CN=localhost"
    echo "✅ Certificates generated in $CERT_DIR"
else
    echo "✨ SSL certificates already exist. Skipping generation."
fi

chmod 644 "$CERT_DIR/privkey.pem" "$CERT_DIR/fullchain.pem"
