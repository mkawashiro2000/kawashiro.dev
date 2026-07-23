#!/usr/bin/env bash
# nuevo-post.sh — crea el esqueleto de un post del blog en los tres idiomas.
#
#   ./scripts/nuevo-post.sh mi-primer-post
#
# Deja src/content/blog/mi-primer-post/{es,en,ja}.md listos para editar.
# Basta con rellenar el que vayas a escribir: si borras los otros, el post
# igual se muestra (cae al idioma disponible).
set -euo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "Uso: $0 <slug-del-post>"
  echo "Ejemplo: $0 como-configure-mi-servidor"
  exit 1
fi

# Normaliza: minúsculas, espacios y guiones bajos a guiones
SLUG=$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | tr ' _' '-')

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$REPO_DIR/src/content/blog/$SLUG"
HOY=$(date +%Y-%m-%d)

if [ -d "$DIR" ]; then
  echo "Ya existe: $DIR"
  exit 1
fi

mkdir -p "$DIR"

crear() {  # crear <archivo> <titulo> <descripcion> <cuerpo>
  cat > "$DIR/$1" <<EOF
---
title: "$2"
description: "$3"
pubDate: $HOY
tags: ["etiqueta1", "etiqueta2"]
---

$4
EOF
}

crear es.md "Título del post" "Una o dos frases que resuman el post; se ven en la tarjeta del listado." \
"Primer párrafo: engancha con el problema o la idea principal.

## Un subtítulo

Texto normal, con **negritas**, \`código en línea\` y listas:

- Punto uno
- Punto dos

\`\`\`python
print(\"Los bloques de código salen con resaltado de sintaxis\")
\`\`\`

## Cierre

Lo que aprendiste o la conclusión."

crear en.md "Post title" "One or two sentences summarizing the post; shown on the listing card." \
"Write the English version here, or delete this file if you only publish in Spanish."

crear ja.md "投稿タイトル" "投稿を要約する1〜2文。一覧のカードに表示されます。" \
"ここに日本語版を書くか、スペイン語だけで公開する場合はこのファイルを削除してください。"

echo "Listo: $DIR"
echo
echo "  1. Edita los archivos .md (empieza por es.md)"
echo "  2. git add -A && git commit -m 'blog: $SLUG' && git push"
echo "  3. En 5 minutos el autodeploy lo publica en kawashiro.dev/blog"
