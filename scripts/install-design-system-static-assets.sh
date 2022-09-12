#!/bin/bash
# Install design system assets.

set -Eeou pipefail
echo "Installing Radicle Design System assets"
cp ./node_modules/radicle-design-system/static/fonts/*.otf ./static/fonts
