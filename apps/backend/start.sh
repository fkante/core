#!/bin/bash

echo "🚀 Starting Backend Server Setup..."

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start development server
echo "🔥 Starting development server..."
pnpm dev

