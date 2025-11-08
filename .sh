#!/usr/bin/env bash
set -euo pipefail
flag() {
	for f in "$@"; do
		[[ -e ".flags/$f" ]] || return 1
	done
}
if flag local; then
	:
else
	npm ci
fi
rm -rf dist
tsc
find ./src/ \
	-type f \
	-not \( \
		-name "*.ts" \
	\) \
	-exec cp {} dist/ \
\;
DATA="$(cat << EOF
Hex_lo&_, Wo&__x_rld!
EOF
)"
export DATA
cd dist
node _.js
{
	echo "$DATA"
	printf "=%.0s" {1..50}
	echo
	cat encoded.txt
} > _.log
