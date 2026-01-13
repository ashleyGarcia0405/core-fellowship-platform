#!/usr/bin/env bash
set -euo pipefail

echo "Starting infra..."
docker compose up -d

echo "Done. Now run in separate terminals:"
echo "  make gateway-run"
echo "  make identity-run"
echo "  make web-dev"