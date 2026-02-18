#!/bin/bash
# Setup kuroshiro dictionaries for client-side usage
# This script copies and decompresses the kuromoji dictionary files
# from node_modules to the public directory

DICT_SOURCE="node_modules/kuromoji/dict"
DICT_DEST="public/dict"

echo "Setting up kuroshiro dictionaries..."

# Create dict directory if it doesn't exist
mkdir -p "$DICT_DEST"

# Copy all dictionary files
cp -r "$DICT_SOURCE"/* "$DICT_DEST/"

# Decompress all .gz files
cd "$DICT_DEST"
for file in *.dat.gz; do
    if [ -f "$file" ]; then
        echo "Decompressing $file..."
        gunzip -c "$file" > "${file%.gz}"
    fi
done

echo "Dictionary setup complete!"
