# Preview Guide

This guide explains how to preview the landing page connected with the workflow builder.

## Quick Start

### Option 1: Run Everything at Once (Recommended)

```bash
# Install dependencies (if not already done)
npm install
cd frontend/workflow-builder && npm install && cd ../..
cd landing && npm install && cd ..

# Start all services
npm run dev:all
```

This will start:
- **Backend API** on http://localhost:3001
- **Workflow Builder** on http://localhost:5173
- **Landing Page** on http://localhost:3000

### Option 2: Run Services Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Workflow Builder:**
```bash
npm run dev:frontend
```

**Terminal 3 - Landing Page:**
```bash
npm run dev:landing
```

## Accessing the Applications

1. **Landing Page**: Open http://localhost:3000 in your browser
   - This is the marketing page
   - Click "Get Started" or "See Demo" buttons to open the workflow builder

2. **Workflow Builder**: Open http://localhost:5173 in your browser
   - This is the visual workflow builder interface
   - Can also be accessed directly from the landing page buttons

3. **Backend API**: http://localhost:3001
   - Health check: http://localhost:3001/health
   - API endpoints: http://localhost:3001/api/workflows/*

## How They Connect

- The **landing page** (Next.js) displays the marketing site
- All "Get Started" and "See Demo" buttons link to the **workflow builder** (Vite/React)
- The **workflow builder** communicates with the **backend API** (Express) via `/api` proxy
- The backend API handles workflow validation, compilation, and execution

## Environment Variables

Make sure you have the following environment variables set:

**Root `.env`:**
```env
PORT=3001
AT_USERNAME=your_username
AT_API_KEY=your_api_key
AT_ENVIRONMENT=sandbox
```

**Landing `.env`:**
```env
NEXT_PUBLIC_WORKFLOW_BUILDER_URL=http://localhost:5173
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Frontend `.env` (optional):**
```env
VITE_API_URL=http://localhost:3001
```

## Troubleshooting

### Port Already in Use
The server will automatically find an available port if the default is in use. Check the console output for the actual port being used.

### Landing Page Links Not Working
- Ensure the workflow builder is running on port 5173
- Check that `NEXT_PUBLIC_WORKFLOW_BUILDER_URL` is set correctly in `landing/.env`

### API Calls Failing
- Ensure the backend is running on port 3001
- Check the browser console for CORS errors
- Verify the Vite proxy configuration in `frontend/workflow-builder/vite.config.ts`

## Development Workflow

1. Start all services: `npm run dev:all`
2. Open landing page: http://localhost:3000
3. Click "Get Started" to open workflow builder
4. Build workflows in the visual builder
5. Test workflows via the API endpoints
