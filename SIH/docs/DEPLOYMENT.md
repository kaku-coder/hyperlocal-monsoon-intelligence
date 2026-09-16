# Deployment & Cloud Hosting Guide

This guide details the deployment steps for frontend static hosting (Vercel), Express backend, and Python FastAPI ML services.

## Frontend Deployment (Vercel)

1. Root Directory: `SIH/frontend`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Routing configuration uses SPA rewrites configured in `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

## Backend Services Deployment

- Node.js Express server runs on port `5000` (or `PORT` env variable).
- Python FastAPI ML microservice runs on port `8000` (or `PORT` env variable).
