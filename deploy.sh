#!/bin/bash
# Deploy SubwayRunner to endlessrunner.vibecoding.company
# Usage: ./deploy.sh
#
# Deploys ONLY production files: index.html, js/, css/
# Pattern: rsync + Nginx (like pferdehof, lialernt)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: .env not found. Create it with VPS_HOST, VPS_USER, VPS_PASS"
    exit 1
fi
source "$ENV_FILE"

DOMAIN="endlessrunner.vibecoding.company"
REMOTE_DIR="/var/www/$DOMAIN"
LOCAL_SRC="$SCRIPT_DIR/SubwayRunner"
SSH_OPTS="-o StrictHostKeyChecking=no -o LogLevel=ERROR"

ssh_cmd() {
    sshpass -p "$VPS_PASS" ssh $SSH_OPTS "$VPS_USER@$VPS_HOST" "$@"
}

echo "=== SubwayRunner Deployment ==="
echo "Target: $DOMAIN ($VPS_USER@$VPS_HOST)"
echo ""

# Step 1: Verify source files
echo "[1/5] Verifying source files..."
[ -f "$LOCAL_SRC/index.html" ] || { echo "ERROR: SubwayRunner/index.html not found"; exit 1; }
[ -d "$LOCAL_SRC/js" ] || { echo "ERROR: SubwayRunner/js/ not found"; exit 1; }
echo "  OK"

# Step 2: Test SSH
echo "[2/5] Testing SSH..."
ssh_cmd "echo 'SSH OK'" || { echo "ERROR: SSH failed"; exit 1; }

# Step 3: Upload ONLY production files (whitelist approach)
echo "[3/5] Uploading production files..."
ssh_cmd "mkdir -p $REMOTE_DIR/js $REMOTE_DIR/css"

# Clean remote dir first, then upload only what's needed
ssh_cmd "rm -rf $REMOTE_DIR/*"

# index.html
sshpass -p "$VPS_PASS" scp $SSH_OPTS "$LOCAL_SRC/index.html" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

# js/ directory (all modules)
sshpass -p "$VPS_PASS" rsync -avz --delete \
    --exclude='.DS_Store' \
    -e "ssh $SSH_OPTS" \
    "$LOCAL_SRC/js/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/js/"

# css/ directory
sshpass -p "$VPS_PASS" rsync -avz --delete \
    --exclude='.DS_Store' \
    -e "ssh $SSH_OPTS" \
    "$LOCAL_SRC/css/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/css/"

echo "  Upload complete"

# Step 4: Nginx config (idempotent — certbot blocks preserved)
echo "[4/5] Configuring Nginx..."
# Only write config if no certbot SSL block exists (first deploy)
HAS_SSL=$(ssh_cmd "grep -c 'managed by Certbot' /etc/nginx/sites-available/$DOMAIN 2>/dev/null || echo 0")
if [ "$HAS_SSL" = "0" ]; then
    ssh_cmd "cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX'
server {
    listen 80;
    server_name endlessrunner.vibecoding.company;
    root /var/www/endlessrunner.vibecoding.company;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css)$ {
        expires 7d;
        add_header Cache-Control \"public\";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_min_length 1000;

    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;

    location ~ /\\. {
        deny all;
    }
}
NGINX
"
    ssh_cmd "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
    echo "  Nginx config written (new)"
else
    echo "  Nginx config exists (certbot managed) — skipping"
fi
ssh_cmd "nginx -t && systemctl reload nginx"
echo "  Nginx reloaded"

# Step 5: Verify
echo "[5/5] Verifying..."
# Count deployed files
FILE_COUNT=$(ssh_cmd "find $REMOTE_DIR -type f | wc -l")
echo "  Files deployed: $FILE_COUNT"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --resolve "$DOMAIN:443:$VPS_HOST" "https://$DOMAIN/" 2>/dev/null || echo "ERR")
if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "=== DEPLOYMENT SUCCESSFUL ==="
    echo "https://$DOMAIN/"
else
    # Try HTTP fallback
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --resolve "$DOMAIN:80:$VPS_HOST" "http://$DOMAIN/" 2>/dev/null || echo "ERR")
    if [ "$HTTP_CODE" = "200" ]; then
        echo ""
        echo "=== DEPLOYED (HTTP only) ==="
        echo "http://$DOMAIN/"
        echo "For HTTPS: certbot --nginx -d $DOMAIN"
    else
        echo ""
        echo "=== WARNING: HTTP $HTTP_CODE ==="
        echo "Debug: host $DOMAIN && curl -I http://$DOMAIN/"
    fi
fi
