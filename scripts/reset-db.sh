#!/bin/bash
# scripts/reset-db.sh
# Reinicia o banco SQLite (apaga dev.db, recria migrações e popula seed)
# USO: bash scripts/reset-db.sh
# Comando para resetar banco de dados (SQLITE)

set -e
echo "⚠️  ATENÇÃO: Este script irá APAGAR o banco local (dev.db) e recriar do zero."
read -p "Confirmar? (s/N): " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
  echo "Operação cancelada."
  exit 0
fi

cd "$(dirname "$0")/../backend" || exit 1

echo ""
echo "🗑️  Resetando banco SQLite..."
npx prisma migrate reset --force

echo ""
echo "🌱 Executando seed..."
npm run seed

echo ""
echo "✅ Banco SQLite reiniciado e populado com sucesso!"
