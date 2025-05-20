#!/bin/bash

# Find all SQL files matching the pattern *_kreator.sql in the current directory
# The script is run from the package root (where package.json is)
find . -maxdepth 1 -name '*_kreator.sql' -print0 | while IFS= read -r -d $'\0' file; do
  if [ -f "$file" ]; then # Check if it's a file
    echo "Processing file: $file"
    # Use sed to add 'IF NOT EXISTS' after 'CREATE TABLE' and 'CREATE SCHEMA'
    # Create a temporary file for sed output
    tmp_file=$(mktemp)
    # Apply substitutions using multiple -e options
    sed -e 's/CREATE TABLE /CREATE TABLE IF NOT EXISTS /g' \
        -e 's/CREATE SCHEMA /CREATE SCHEMA IF NOT EXISTS /g' "$file" > "$tmp_file" && mv "$tmp_file" "$file"
    echo "Added 'IF NOT EXISTS' to CREATE TABLE and CREATE SCHEMA statements in $file"
  fi
done

echo "Script finished."
