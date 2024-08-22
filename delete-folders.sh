#!/bin/bash

# Defina a lista de pastas
folders=("vue" "store" "angular" "solid" "preact" "testing")

# Verifica o sistema operacional
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    # Para sistemas Linux ou MacOS
    for folder in "${folders[@]}"; do
        if [ -d "$folder" ]; then
            rm -rf "$folder"
            echo "Deleted folder: $folder"
        else
            echo "Folder $folder does not exist, skipping..."
        fi
    done
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Para sistemas Windows
    for folder in "${folders[@]}"; do
        if [ -d "$folder" ]; then
            rmdir /s /q "$folder"
            echo "Deleted folder: $folder"
        else
            echo "Folder $folder does not exist, skipping..."
        fi
    done
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi