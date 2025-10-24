# PowerShell script for deploying e-commerce application to Kind cluster on Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "E-commerce Application - Kind Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Kind is installed
if (-not (Get-Command kind -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Kind is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
}

# Check if kubectl is installed
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "Error: kubectl is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Helm is installed
if (-not (Get-Command helm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Helm is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Create Kind cluster
Write-Host "Step 1: Creating Kind cluster..." -ForegroundColor Yellow
$existingCluster = kind get clusters | Select-String "ecommerce"
if ($existingCluster) {
    Write-Host "Cluster 'ecommerce' already exists. Deleting it..." -ForegroundColor Yellow
    kind delete cluster --name ecommerce
}

kind create cluster --config kind-config.yaml
Write-Host "Kind cluster created successfully" -ForegroundColor Green
Write-Host ""

# Wait for cluster to be ready
Write-Host "Step 2: Waiting for cluster to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=Ready nodes --all --timeout=120s
Write-Host "Cluster is ready" -ForegroundColor Green
Write-Host ""

# Build Docker images
Write-Host "Step 3: Building Docker images..." -ForegroundColor Yellow
docker build -t user-service:latest ./backend/user-service
docker build -t product-service:latest ./backend/product-service
docker build -t order-service:latest ./backend/order-service
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t ecommerce-frontend:latest ./frontend
Write-Host "Docker images built successfully" -ForegroundColor Green
Write-Host ""

# Load images into Kind cluster
Write-Host "Step 4: Loading images into Kind cluster..." -ForegroundColor Yellow
kind load docker-image user-service:latest --name ecommerce
kind load docker-image product-service:latest --name ecommerce
kind load docker-image order-service:latest --name ecommerce
kind load docker-image api-gateway:latest --name ecommerce
kind load docker-image ecommerce-frontend:latest --name ecommerce
Write-Host "Images loaded into Kind cluster" -ForegroundColor Green
Write-Host ""

# Create namespace
Write-Host "Step 5: Creating namespace..." -ForegroundColor Yellow
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -
Write-Host "Namespace created" -ForegroundColor Green
Write-Host ""

# Deploy with Helm
Write-Host "Step 6: Deploying application with Helm..." -ForegroundColor Yellow
helm upgrade --install ecommerce ./helm-chart --namespace ecommerce --set image.pullPolicy=IfNotPresent --wait --timeout 10m
Write-Host "Application deployed successfully" -ForegroundColor Green
Write-Host ""

# Wait for all pods to be ready
Write-Host "Step 7: Waiting for all pods to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=600s
Write-Host "All pods are ready" -ForegroundColor Green
Write-Host ""

# Display deployment information
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Green
Write-Host "  Frontend:    http://localhost:30300" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:30800" -ForegroundColor White
Write-Host "  PHPMyAdmin:  http://localhost:30080" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  Check pods:     kubectl get pods -n ecommerce"
Write-Host "  Check services: kubectl get svc -n ecommerce"
Write-Host "  View logs:      kubectl logs -l app=frontend -n ecommerce"
Write-Host "  Delete cluster: kind delete cluster --name ecommerce"
Write-Host ""
Write-Host "Pods status:" -ForegroundColor Yellow
kubectl get pods -n ecommerce
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
kubectl get svc -n ecommerce
