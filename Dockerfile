# ---- Stage 1: Build the React Frontend ----
FROM node:20-alpine AS build-stage

WORKDIR /app/frontend

# Copy frontend source and install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Setup FastAPI Backend ----
FROM python:3.11-slim

WORKDIR /app

# Copy the requirements file and install python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir uvicorn gunicorn python-multipart

# Copy the backend code
COPY backend/ ./backend/

# Copy the built React app from the build stage into the backend's static directory
# We will serve this directly via FastAPI
COPY --from=build-stage /app/frontend/dist /app/backend/dist

# Expose port (Render/Railway default is usually 10000 or specified by PORT env dir, 
# but we will bind to 0.0.0.0:$PORT or 8000)
ENV PORT=8000
EXPOSE $PORT

# Run the FastAPI app using Uvicorn
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
