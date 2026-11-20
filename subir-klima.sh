#!/usr/bin/env bash
set -Eeuo pipefail

# Ejecutar desde Git Bash en la carpeta raíz del proyecto Klima.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: Git no está instalado o Git Bash no lo encuentra."
  exit 1
fi

if [[ ! -f "package.json" || ! -d "frontend" || ! -d "backend" ]]; then
  echo "ERROR: No parece ser la carpeta raíz del proyecto Klima."
  exit 1
fi

echo "=========================================="
echo "  KLIMA - COMMITS AUTOMÁTICOS Y SUBIDA"
echo "=========================================="
echo

if [[ ! -d .git ]]; then
  git init
fi

git branch -M main

# Configura la identidad solo en este repositorio si todavía no existe.
if [[ -z "$(git config user.name || true)" ]]; then
  read -r -p "Tu nombre para los commits: " GIT_NAME
  if [[ -z "$GIT_NAME" ]]; then echo "ERROR: el nombre no puede quedar vacío."; exit 1; fi
  git config user.name "$GIT_NAME"
fi
if [[ -z "$(git config user.email || true)" ]]; then
  read -r -p "Tu email de GitHub: " GIT_EMAIL
  if [[ -z "$GIT_EMAIL" ]]; then echo "ERROR: el email no puede quedar vacío."; exit 1; fi
  git config user.email "$GIT_EMAIL"
fi

make_commit() {
  local message="$1"
  shift
  git add -- "$@"
  if git diff --cached --quiet; then
    echo "- Sin cambios para: $message (se omite)"
  else
    git commit -m "$message"
  fi
}

echo "\n[1/4] Documentación y reglas del proyecto..."
make_commit "docs: agrega documentación y planificación de Klima" docs/ agents/ .cursor/ README.md

echo "\n[2/4] Sitio web comercial..."
make_commit "feat(frontend): implementa el sitio web de Klima" frontend/

echo "\n[3/4] API y sistema de gestión..."
make_commit "feat(backend): implementa API y gestión de solicitudes" backend/

echo "\n[4/4] Configuración del proyecto..."
make_commit "chore: configura entorno y dependencias del proyecto" package.json docker-compose.yml .gitignore .env.example subir-klima.sh

echo "\nHistorial generado:"
git --no-pager log --oneline -n 8

echo "\nEstado actual:"
git status --short

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$REMOTE_URL" ]]; then
  echo
  echo "No hay un repositorio remoto configurado."
  read -r -p "Pegá la URL HTTPS de tu repositorio GitHub (o Enter para terminar sin subir): " REPO_URL
  if [[ -n "$REPO_URL" ]]; then
    git remote add origin "$REPO_URL"
  else
    echo "Commits creados localmente. Podés configurar GitHub y ejecutar: git push -u origin main"
    exit 0
  fi
fi

echo
read -r -p "¿Querés subir ahora los commits a GitHub? [s/N]: " PUSH_ANSWER
case "$PUSH_ANSWER" in
  s|S|si|SI|Si|sí|Sí)
    git push -u origin main
    echo "\n¡Subida completada! Revisá el repositorio en GitHub."
    ;;
  *)
    echo "Los commits quedaron guardados localmente. Para subirlos después ejecutá: git push -u origin main"
    ;;
esac
