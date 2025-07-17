#!/bin/bash

# Install dependencies for the dashboard-widget package
echo "Installing dependencies for dashboard-widget..."

# Install production dependencies
npm install

# Install dev dependencies
npm install --save-dev

echo "Dependencies installed successfully!"
echo "You can now build the package with: npm run build" 