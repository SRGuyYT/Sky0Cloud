SHELL := /usr/bin/env bash

install:
	bash scripts/install.sh

up:
	docker compose up -d

down:
	docker compose down

logs:
	bash scripts/logs.sh

backup:
	bash scripts/backup.sh

restore:
	@if [ -z "$(ARCHIVE)" ]; then echo "Usage: make restore ARCHIVE=backups/<file>.tgz"; exit 1; fi
	bash scripts/restore.sh "$(ARCHIVE)"
