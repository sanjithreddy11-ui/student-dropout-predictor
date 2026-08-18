#!/usr/bin/env bash
# Convenience launcher: starts the FastAPI backend and the Vite frontend together.
set -e

echo "Starting backend on http://localhost:8000 ..."
(cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

sleep 2

echo "Starting frontend on http://localhost:5173 ..."
(cd frontend && npm run dev)

kill $BACKEND_PID
