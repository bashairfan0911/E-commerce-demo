#!/bin/bash

# Deploy e-commerce application to Kind cluster

set -e

echo "=========================================="
echo "E-commerce Application - Kind Deployment"
echo "=========================================="
echo ""

# Check if Kind is installed
if ! command -v kind &> /dev/null; then
    echo "Error: Kind is not installed. Please install it first."
    echo "Visit: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed. Please install it first."
    exit 1
fi

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo "Error: Helm is not installed. Please install it first."
    exit 1
fi

# Create Kind cluster
echo "Step 1: Creating Kind cluster..."
if kind get clusters | grep -q "ecommerce"; then
    echo "Cluster 'ecommerce' already exists. Deleting it..."
    kind delete cluster --name ecommerce
fi

kind create cluster --config kind-config.yaml
echo "✓ Kind cluster created successfully"
echo ""

# Wait for cluster to be ready
echo "Step 2: Waiting for cluster to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s
echo "✓ Cluster is ready"
echo ""

# Build Docker images
echo "Step 3: Building Docker images..."
docker build -t user-service:latest ./backend/user-service
docker build -t product-service:latest ./backend/product-service
docker build -t order-service:latest ./backend/order-service
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t ecommerce-frontend:latest ./frontend
echo "✓ Docker images built successfully"
echo ""

# Load images into Kind cluster
echo "Step 4: Loading images into Kind cluster..."
kind load docker-image user-service:latest --name ecommerce
kind load docker-image product-service:latest --name ecommerce
kind load docker-image order-service:latest --name ecommerce
kind load docker-image api-gateway:latest --name ecommerce
kind load docker-image ecommerce-frontend:latest --name ecommerce
echo "✓ Images loaded into Kind cluster"
echo ""

# Create namespace
echo "Step 5: Creating namespace..."
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Namespace created"
echo ""

# Deploy with Helm
echo "Step 6: Deploying application with Helm..."
helm upgrade --install ecommerce ./helm-chart \
    --namespace ecommerce \
    --set image.pullPolicy=IfNotPresent \
    --wait \
    --timeout 10m
echo "✓ Application deployed successfully"
echo ""

# Wait for all pods to be ready
echo "Step 7: Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=600s
echo "✓ All pods are ready"
echo ""

# Display deployment information
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Access the application at:"
echo "  Frontend:    http://localhost:30300"
echo "  API Gateway: http://localhost:30800"
echo "  PHPMyAdmin:  http://localhost:30080"
echo ""
echo "Useful commands:"
echo "  Check pods:     kubectl get pods -n ecommerce"
echo "  Check services: kubectl get svc -n ecommerce"
echo "  View logs:      kubectl logs -l app=frontend -n ecommerce"
echo "  Delete cluster: kind delete cluster --name ecommerce"
echo ""
echo "Pods status:"
kubectl get pods -n ecommerce
echo ""
echo "Services:"
kubectl get svc -n ecommerce
