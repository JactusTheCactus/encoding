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
	:
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
cd dist
node _.js
