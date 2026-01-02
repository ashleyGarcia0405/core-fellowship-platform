SHELL := /bin/bash

.PHONY: help up down logs clean \
        web-install web-dev \
        services-build services-run \
        gateway-run identity-run

help:
	@echo "Common commands:"
	@echo "  make up           Start infra (Mongo + Mongo Express)"
	@echo "  make down         Stop infra"
	@echo "  make logs         Tail infra logs"
	@echo "  make web-install  Install web deps"
	@echo "  make web-dev      Run web (Next.js)"
	@echo "  make services-build Build all Java services"
	@echo "  make gateway-run  Run API gateway"
	@echo "  make identity-run Run identity service"

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v

web-install:
	cd web/portal && npm install

web-dev:
	cd web/portal && npm run dev -- --host


services-build:
	cd services && ./gradlew build

gateway-run:
	cd services/api-gateway && ../gradlew bootRun

identity-run:
	cd services/identity-service && ../gradlew bootRun
