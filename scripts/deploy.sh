#!/bin/bash
# Script di deploy per BailaGo
# Da eseguire sul server di produzione

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurazione
DEPLOY_DIR="/opt/bailago"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-your-username/bailago}"
REGISTRY="ghcr.io"
TAG="${1:-latest}"

echo -e "${GREEN}🚀 BailaGo Deploy Script${NC}"
echo -e "${YELLOW}Tag: ${TAG}${NC}"
echo ""

# Verifica che siamo nella directory corretta
cd "$DEPLOY_DIR" || { echo -e "${RED}Directory $DEPLOY_DIR non trovata${NC}"; exit 1; }

# Login a GHCR (richiede GITHUB_TOKEN come variabile d'ambiente)
echo -e "${YELLOW}📦 Login a GitHub Container Registry...${NC}"
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

# Pull delle nuove immagini
echo -e "${YELLOW}⬇️ Pulling nuove immagini...${NC}"
export TAG="$TAG"
export GITHUB_REPOSITORY="$GITHUB_REPOSITORY"

docker compose pull

# Backup del database (se presente)
# echo -e "${YELLOW}💾 Backup database...${NC}"
# docker compose exec -T db pg_dump -U postgres bailago > "backups/backup_$(date +%Y%m%d_%H%M%S).sql"

# Stop e rimuovi container vecchi
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker compose down --remove-orphans

# Avvia i nuovi container
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
docker compose up -d

# Aspetta che i container siano healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Verifica health check
echo -e "${YELLOW}🏥 Checking service health...${NC}"
if curl -sf http://localhost/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker compose logs backend --tail=50
    exit 1
fi

if curl -sf http://localhost/ > /dev/null; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker compose logs frontend --tail=50
    exit 1
fi

# Pulizia immagini vecchie
echo -e "${YELLOW}🧹 Cleaning old images...${NC}"
docker image prune -af --filter "until=24h"

# Log finale
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deploy completato con successo!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Tag deployato: ${TAG}"
echo -e "Timestamp: $(date)"
echo ""

# Mostra status dei container
docker compose ps
