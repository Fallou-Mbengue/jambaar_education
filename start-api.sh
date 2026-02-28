#!/bin/bash
cd /home/user/jambaar_education

# Load environment variables
export $(grep -v '^#' .env | xargs -0)

# Start the API
cd apps/api
npm run start:dev
