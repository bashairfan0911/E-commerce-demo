#!/bin/bash

# Deploy e-commerce application to Minikube

echo "Starting Minikube deployment..."

# Start Minikube if not running
if ! minikube status > /dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start --cpus=4 --memory=8192
fi

# Load images into Minikube
echo "Loading images into Minikube..."
minikube image load user-service:latest
minikube image load product-service:latest
minikube image load order-service:latest
minikube image load api-gateway:latest
minikube image load ecommerce-frontend:latest

# Create namespace
echo "Creating namespace..."
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
echo "Deploying with Helm..."
helm upgrade --install ecommerce ./helm-chart --namespace ecommerce

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=300s

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

echo ""
echo "Deployment complete!"
echo ""
echo "Access the application at:"
echo "  Frontend: http://$MINIKUBE_IP:30300"
echo "  API Gateway: http://$MINIKUBE_IP:30800"
echo "  PHPMyAdmin: http://$MINIKUBE_IP:30080"
echo ""
echo "Check status with: kubectl get pods -n ecommerce"
