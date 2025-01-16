#!/usr/bin/env bash
set -euo pipefail

self_dir="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
root_dir="$(dirname "${self_dir}")"

directory="${root_dir}/images"

function process() {
    local name="${1}"
    shift
    local extra_args="${*}"
    echo "Processing ${name}"
    echo "extra_args: ${extra_args}"

    cwebp "${directory}/${name}" -q 80 -o "${root_dir}/public/assets/images/${name%.*}.webp" ${extra_args}
}

for file in $(find "${directory}" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \)); do
  process "${file#"$directory"/}"
done
