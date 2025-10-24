# Kind Cluster Deployment Guide

Complete guide for deploying the E-commerce application on Kind (Kubernetes in Docker).

## Why Kind?

Kind is perfect for:
- Local development and testing
- CI/CD pipelines
- Learning Kubernetes
- Fast cluster creation/deletion
- Works on Windows, Mac, and Linux

## Prerequisites

### 1. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- Ensure Docker is running

### 2. Install Kind
**Windows (PowerShell):**
```powershell
# Using Chocolatey
choco install kind

# Or download binary
curl.exe -Lo kind-windows-amd64.exe https://kind.sigs.k8s.io/dl/v0.20.0/kind-windows-amd64
Move-Item .\kind-windows-amd64.exe C:\Windows\System32\kind.exe
```

**Mac:**
```bash
brew install kind
```

**Linux:**
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### 3. Install kubectl
**Windows:**
```powershell
choco install kubernetes-cli
```

**Mac:**
```bash
brew install kubectl
```

**Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### 4. Install Helm
**Windows:**
```powershell
choco install kubernetes-helm
```

**Mac:**
```bash
brew install helm
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## Quick Start

### Option 1: Automated Deployment (Recommended)

**Windows:**
```powershell
.\scripts\deploy-kind.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-kind.sh
./scripts/deploy-kind.sh
```

This script will:
1. Create a Kind cluster with 3 nodes
2. Build all Docker images
3. Load images into the cluster
4. Deploy the application with Helm
5. Wait for all pods to be ready

### Option 2: Manual Deployment

#### Step 1: Create Kind Cluster

```bash
kind create cluster --config kind-config.yaml
```

This creates a cluster with:
- 1 control-plane node
- 2 worker nodes
- Port mappings for NodePort services (30300, 30800, 30080)

#### Step 2: Verify Cluster

```bash
kubectl cluster-info --context kind-ecommerce
kubectl get nodes
```

#### Step 3: Build Docker Images

```bash
docker build -t user-service:latest ./backend/user-service
docker build -t product-service:latest ./backend/product-service
docker build -t order-service:latest ./backend/order-service
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t ecommerce-frontend:latest ./frontend
```

#### Step 4: Load Images into Kind

```bash
kind load docker-image user-service:latest --name ecommerce
kind load docker-image product-service:latest --name ecommerce
kind load docker-image order-service:latest --name ecommerce
kind load docker-image api-gateway:latest --name ecommerce
kind load docker-image ecommerce-frontend:latest --name ecommerce
```

#### Step 5: Deploy with Helm

```bash
# Create namespace
kubectl create namespace ecommerce

# Install the chart
helm install ecommerce ./helm-chart \
    --namespace ecommerce \
    --set image.pullPolicy=IfNotPresent
```

#### Step 6: Wait for Deployment

```bash
kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=600s
```

## Accessing the Application

Once deployed, access the services at:

- **Frontend**: http://localhost:30300
- **API Gateway**: http://localhost:30800
- **PHPMyAdmin**: http://localhost:30080

## Monitoring and Debugging

### Check Pod Status

```bash
# Get all pods
kubectl get pods -n ecommerce

# Watch pods in real-time
kubectl get pods -n ecommerce -w

# Describe a specific pod
kubectl describe pod <pod-name> -n ecommerce
```

### View Logs

```bash
# View logs for a specific pod
kubectl logs <pod-name> -n ecommerce

# Follow logs
kubectl logs -f <pod-name> -n ecommerce

# View logs for all frontend pods
kubectl logs -l app=frontend -n ecommerce

# View logs for all pods
kubectl logs -l app -n ecommerce --all-containers=true
```

### Check Services

```bash
# Get all services
kubectl get svc -n ecommerce

# Describe a service
kubectl describe svc ecommerce-app-frontend -n ecommerce

# Get endpoints
kubectl get endpoints -n ecommerce
```

### Access MySQL Database

```bash
# Get MySQL pod name
kubectl get pods -n ecommerce | grep mysql

# Connect to MySQL
kubectl exec -it <mysql-pod-name> -n ecommerce -- mysql -u root -prootpassword

# Run SQL commands
kubectl exec -it <mysql-pod-name> -n ecommerce -- mysql -u root -prootpassword -e "SHOW DATABASES;"
```

### Port Forwarding (Alternative Access)

If NodePort doesn't work, use port forwarding:

```bash
# Frontend
kubectl port-forward -n ecommerce svc/ecommerce-app-frontend 3000:3000

# API Gateway
kubectl port-forward -n ecommerce svc/ecommerce-app-api-gateway 8000:8000

# PHPMyAdmin
kubectl port-forward -n ecommerce svc/ecommerce-app-phpmyadmin 8080:80
```

## Updating the Application

### Rebuild and Reload Images

```bash
# Rebuild a specific service
docker build -t user-service:latest ./backend/user-service

# Reload into Kind
kind load docker-image user-service:latest --name ecommerce

# Restart the deployment
kubectl rollout restart deployment/ecommerce-app-user-service -n ecommerce
```

### Update Configuration

```bash
# Edit values
nano helm-chart/values.yaml

# Upgrade the release
helm upgrade ecommerce ./helm-chart -n ecommerce
```

## Scaling

### Manual Scaling

```bash
# Scale user service to 5 replicas
kubectl scale deployment ecommerce-app-user-service --replicas=5 -n ecommerce

# Scale frontend to 3 replicas
kubectl scale deployment ecommerce-app-frontend --replicas=3 -n ecommerce
```

### Check Scaling

```bash
kubectl get pods -n ecommerce -l app=user-service
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n ecommerce

# Check logs
kubectl logs <pod-name> -n ecommerce

# Check previous logs if pod crashed
kubectl logs <pod-name> -n ecommerce --previous
```

### Image Pull Errors

Kind uses local images, so ensure images are loaded:

```bash
# List images in Kind cluster
docker exec -it ecommerce-control-plane crictl images

# Reload image if missing
kind load docker-image <image-name>:latest --name ecommerce
```

### Database Connection Issues

```bash
# Check MySQL service
kubectl get svc ecommerce-app-mysql -n ecommerce

# Test connection from another pod
kubectl run -it --rm debug --image=mysql:8.0 --restart=Never -n ecommerce -- \
  mysql -h ecommerce-app-mysql -u root -prootpassword
```

### Service Not Accessible

```bash
# Check if service exists
kubectl get svc -n ecommerce

# Check endpoints
kubectl get endpoints -n ecommerce

# Check node ports
kubectl get svc -n ecommerce -o wide
```

### Cluster Issues

```bash
# Check cluster status
kubectl cluster-info --context kind-ecommerce

# Check nodes
kubectl get nodes

# Restart cluster
kind delete cluster --name ecommerce
kind create cluster --config kind-config.yaml
```

## Cleanup

### Delete Application Only

```bash
# Uninstall Helm release
helm uninstall ecommerce -n ecommerce

# Delete namespace
kubectl delete namespace ecommerce
```

### Delete Entire Cluster

**Windows:**
```powershell
.\scripts\cleanup-kind.ps1
```

**Linux/Mac:**
```bash
./scripts/cleanup-kind.sh
```

Or manually:
```bash
kind delete cluster --name ecommerce
```

## Advanced Configuration

### Custom Values

Create `custom-values.yaml`:

```yaml
mysql:
  rootPassword: "secure-password"
  persistence:
    size: 20Gi

userService:
  replicaCount: 3
  env:
    googleClientId: "your-client-id.apps.googleusercontent.com"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
```

Deploy with custom values:
```bash
helm install ecommerce ./helm-chart -f custom-values.yaml -n ecommerce
```

### Multi-Node Cluster

Edit `kind-config.yaml` to add more workers:

```yaml
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

### Enable Ingress

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

Update `values.yaml`:
```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ecommerce.local
      paths:
        - path: /
          pathType: Prefix
```

Add to `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on Windows):
```
127.0.0.1 ecommerce.local
```

## Performance Tips

1. **Allocate More Resources to Docker**
   - Increase CPU and memory in Docker Desktop settings
   - Recommended: 4 CPUs, 8GB RAM

2. **Use Local Registry** (for faster image loading)
   ```bash
   # Create local registry
   docker run -d -p 5000:5000 --name kind-registry registry:2
   
   # Tag and push images
   docker tag user-service:latest localhost:5000/user-service:latest
   docker push localhost:5000/user-service:latest
   ```

3. **Reduce Replica Count** for development
   ```yaml
   userService:
     replicaCount: 1
   productService:
     replicaCount: 1
   ```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Test on Kind

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Create Kind cluster
        uses: helm/kind-action@v1.5.0
        with:
          cluster_name: ecommerce
          config: kind-config.yaml
      
      - name: Build and load images
        run: |
          docker build -t user-service:latest ./backend/user-service
          kind load docker-image user-service:latest --name ecommerce
      
      - name: Deploy with Helm
        run: |
          helm install ecommerce ./helm-chart -n ecommerce --create-namespace
          kubectl wait --for=condition=ready pod --all -n ecommerce --timeout=600s
      
      - name: Run tests
        run: |
          kubectl get pods -n ecommerce
```

## Useful Commands Reference

```bash
# Cluster Management
kind create cluster --config kind-config.yaml
kind get clusters
kind delete cluster --name ecommerce

# Image Management
kind load docker-image <image>:latest --name ecommerce
docker exec -it ecommerce-control-plane crictl images

# Deployment
helm install ecommerce ./helm-chart -n ecommerce
helm upgrade ecommerce ./helm-chart -n ecommerce
helm uninstall ecommerce -n ecommerce

# Monitoring
kubectl get all -n ecommerce
kubectl logs -f <pod-name> -n ecommerce
kubectl describe pod <pod-name> -n ecommerce
kubectl top nodes
kubectl top pods -n ecommerce

# Debugging
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh
kubectl port-forward <pod-name> 8080:8080 -n ecommerce
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

## Additional Resources

- [Kind Documentation](https://kind.sigs.k8s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Documentation](https://docs.docker.com/)
