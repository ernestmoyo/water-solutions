#!/usr/bin/env bash
set -euo pipefail

echo "=== Izbezkalī Water Dashboard — Setup ==="
echo ""

# Check Docker
if ! command -v docker &>/dev/null; then
    echo "ERROR: Docker is required. Install from https://docs.docker.com/get-docker/"
    exit 1
fi

# Copy .env
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "  Done. Edit .env with your settings."
fi

# Start services
echo ""
echo "Starting Docker services..."
docker compose up -d --build

echo ""
echo "Waiting for PostgreSQL..."
sleep 5

# Seed data
echo "Seeding database with sample Tanzania data..."
docker compose exec backend python seed.py

echo ""
echo "=== Setup Complete ==="
echo ""
echo "  Backend API:   http://localhost:8000/docs"
echo "  Frontend:      http://localhost:3000"
echo "  Health check:  http://localhost:8000/health"
echo ""
echo "  Demo accounts:"
echo "    minister@maji.go.tz / minister123"
echo "    ceo@dawasa.go.tz / ceo123"
echo "    operator@dawasa.go.tz / operator123"
echo ""
echo "Developed by Rodden R. Chikonzo & Ernest Moyo | 7Square Inc."
