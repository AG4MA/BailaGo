#!/bin/bash
# Script di setup iniziale per il server di produzione
# Da eseguire UNA SOLA VOLTA quando si configura il server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 BailaGo Server Setup${NC}"
echo ""

# Variabili da configurare
DEPLOY_DIR="/opt/bailago"
GITHUB_REPOSITORY="${1:-your-username/bailago}"

# Crea directory
echo -e "${YELLOW}📁 Creating directories...${NC}"
sudo mkdir -p "$DEPLOY_DIR"
sudo mkdir -p "$DEPLOY_DIR/backups"
sudo chown -R $USER:$USER "$DEPLOY_DIR"

# Crea file .env per produzione
echo -e "${YELLOW}📝 Creating .env file...${NC}"
cat > "$DEPLOY_DIR/.env" << EOF
# BailaGo Production Environment
# ⚠️ CAMBIA QUESTI VALORI!

NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=https://yourdomain.com

# GitHub Container Registry
GITHUB_REPOSITORY=$GITHUB_REPOSITORY
GITHUB_USER=your-github-username
GITHUB_TOKEN=your-github-pat-token

TAG=latest
EOF

echo -e "${YELLOW}⚠️  Modifica $DEPLOY_DIR/.env con i tuoi valori!${NC}"

# Copia docker-compose.yml
echo -e "${YELLOW}📋 Copy docker-compose.yml to $DEPLOY_DIR${NC}"
cp docker-compose.yml "$DEPLOY_DIR/"

# Copia script di deploy
cp scripts/deploy.sh "$DEPLOY_DIR/"
chmod +x "$DEPLOY_DIR/deploy.sh"

# Crea systemd service per auto-restart
echo -e "${YELLOW}🔄 Creating systemd service...${NC}"
sudo tee /etc/systemd/system/bailago.service > /dev/null << EOF
[Unit]
Description=BailaGo Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
EnvironmentFile=$DEPLOY_DIR/.env
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose restart

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable bailago.service

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup completato!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Prossimi passi:"
echo -e "1. Modifica ${YELLOW}$DEPLOY_DIR/.env${NC} con i tuoi valori"
echo -e "2. Esegui ${YELLOW}cd $DEPLOY_DIR && ./deploy.sh${NC}"
echo -e "3. Configura il firewall: ${YELLOW}sudo ufw allow 80${NC}"
echo ""
