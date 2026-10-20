#!/usr/bin/env bash
# Publie l'APK Android sur R2 sous une URL stable :
#   https://download.masomo.app/masomo.apk
#
# Usage (depuis mobile/) :
#   ./scripts/publish-apk.sh           -> lance une build production puis publie
#   ./scripts/publish-apk.sh --latest  -> publie la dernière build Android terminée
set -euo pipefail

BUCKET="masomo-downloads"
PUBLIC_URL="https://download.masomo.app/masomo.apk"
APK_TYPE="application/vnd.android.package-archive"

if [[ "${1:-}" == "--latest" ]]; then
  BUILD_JSON=$(eas build:list --platform android --status finished --limit 1 --json --non-interactive)
else
  BUILD_JSON=$(eas build --platform android --profile production --non-interactive --wait --json)
fi

# Lecture du JSON avec node (jq n'est pas toujours installé sous Windows)
read_field() {
  echo "$BUILD_JSON" | node -e "
    let s = '';
    process.stdin.on('data', d => s += d).on('end', () => {
      const b = JSON.parse(s)[0];
      console.log($1 ?? '');
    });"
}

APK_URL=$(read_field "b.artifacts?.buildUrl")
VERSION=$(read_field "b.appVersion")
CODE=$(read_field "b.appBuildVersion")

if [[ -z "$APK_URL" ]]; then
  echo "Aucune URL d'APK trouvée dans la build EAS." >&2
  exit 1
fi

TMP_APK=$(mktemp -t masomo-XXXXXX.apk)
trap 'rm -f "$TMP_APK"' EXIT

echo "Téléchargement de la build $VERSION ($CODE)..."
curl -fL "$APK_URL" -o "$TMP_APK"

echo "Envoi de la copie versionnée..."
npx wrangler r2 object put "$BUCKET/archive/masomo-$VERSION-$CODE.apk" --file "$TMP_APK" --remote \
  --content-type "$APK_TYPE"

echo "Remplacement de masomo.apk..."
npx wrangler r2 object put "$BUCKET/masomo.apk" --file "$TMP_APK" --remote \
  --content-type "$APK_TYPE" \
  --cache-control "no-cache" \
  --content-disposition 'attachment; filename="masomo.apk"'

echo "Publié : $VERSION ($CODE) -> $PUBLIC_URL"
