#!/bin/bash

# Configuration
IMAGE_NAME="catan-app"
CONTAINER_NAME="catan-instance"
PORT=4567

case "$1" in
  build)
    echo "🏗️ Building Catan Docker Image..."
    docker build -t $IMAGE_NAME .
    ;;
  run)
    echo "🚀 Starting Catan on http://localhost:$PORT"
    docker run --rm --name $CONTAINER_NAME -p $PORT:$PORT $IMAGE_NAME
    ;;
  stop)
    echo "🛑 Stopping Catan..."
    docker stop $CONTAINER_NAME
    ;;
  clean)
    echo "🧹 Removing image..."
    docker rmi $IMAGE_NAME
    ;;
  *)
    echo "Usage: $0 {build|run|stop|clean}"
    exit 1
esac
