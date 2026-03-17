#!/bin/bash

MODE=${1:-dev}

# Guarda el directorio actual
ROOT_DIR=$(pwd)

if [ "$MODE" = "prod" ]; then
  cd "$ROOT_DIR/backend" && npm run start:prod &
  cd "$ROOT_DIR/frontend" && npm run build && npm run preview &
else
  cd "$ROOT_DIR/backend" && npm run start:dev &
  cd "$ROOT_DIR/frontend" && npm run dev &
fi

wait
