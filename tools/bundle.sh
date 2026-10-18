#!/usr/bin/env bash
# Gera a versão de instalação fácil (3 arquivos) a partir de apps-script/
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=apps-script
OUT=instalacao-facil
mkdir -p "$OUT"
{
  echo "// KEPHRA SYSTEM — arquivo único gerado por tools/bundle.sh. Não edite aqui; edite apps-script/."
  for f in Config Time Db Scheduler Calendar AI Strategy Email Code; do
    echo; echo "// ==================== $f.gs ===================="; cat "$SRC/$f.gs"
  done
} > "$OUT/Kephra.gs"
python3 - "$SRC" "$OUT" <<'PY'
import sys
src, out = sys.argv[1], sys.argv[2]
idx = open(f'{src}/Index.html').read()
idx = idx.replace("<?!= include('Styles'); ?>", open(f'{src}/Styles.html').read())
idx = idx.replace("<?!= include('App'); ?>", open(f'{src}/App.html').read())
open(f'{out}/Index.html', 'w').write(idx)
PY
cp "$SRC/appsscript.json" "$OUT/appsscript.json"
echo "ok: $OUT/{Kephra.gs,Index.html,appsscript.json}"
