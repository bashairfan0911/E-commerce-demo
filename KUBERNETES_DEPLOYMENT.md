# Kubernetes Deployment Guide

Complete guide for deploying the E-commerce application on Kubernetes using Helm.

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- Docker
- Kubernetes cluster (Minikube, Kind, or cloud provider)
- kubectl
- Helm 3.x

### 2. Start Kubernetes Cluster

**Using Minikube:**
```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
```

**Using Kind:**
```bash
kind create cluster --name ecommerce
```

### 3. Build Docker Images

```bash
# Build all images
docker build -t user-service:latest ./backend/user-service
docker build -t product-service:latest ./backend/product-service
docker build -t order-service:latest ./backend/order-service
docker build -t api-gateway:latest ./backend/api-gateway
docker build -t ecommerce-frontend:latest ./frontend
```

**For Minikube (load images into Minikube):**
```bash
minikube image load user-service:latest
minikube image load product-service:latest
minikube image load order-service:latest
minikube image load api-gateway:latest
minikube image load ecommerce-frontend:latest
```

### 4. Deploy with Helm

```bash
# Create namespace
kubectl create namespace ecommerce

# Install the chart
helm install ecommerce ./helm-chart --namespace ecommerce

# Check deployment status
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
```

### 5. Access the Application

**Using Minikube:**
```bash
# Get the Minikube IP
minikube ip

# Access services
# Frontend: http://<minikube-ip>:30300
# API Gateway: http://<minikube-ip>:30800
# PHPMyAdmin: http://<minikube-ip>:30080
```

**Using Port Forwarding:**
```bash
# Frontend
kubectl port-forward -n ecommerce svc/ecommerce-app-frontend 3000:3000

# API Gateway
kubectl port-forward -n ecommerce svc/ecommerce-app-api-gateway 8000:8000

# PHPMyAdmin
kubectl port-forward -n ecommerce svc/ecommerce-app-phpmyadmin 8080:80
```

## Configuration

### Update Google OAuth Credentials

Create a `custom-values.yaml`:

```yaml
userService:
  env:
    googleClientId: "your-client-id.apps.googleusercontent.com"

frontend:
  env:
    googleClientId: "your-client-id.apps.googleusercontent.com"
```

Deploy with custom values:
```bash
helm upgrade ecommerce ./helm-chart -f custom-values.yaml -n ecommerce
```

### Using Kubernetes Secrets (Recommended)

Create a secret for sensitive data:

```bash
kubectl create secret generic ecommerce-secrets \
  --from-literal=mysql-root-password=your-secure-password \
  --from-literal=google-client-id=your-client-id \
  -n ecommerce
```

## Scaling

### Manual Scaling

```bash
# Scale user service
kubectl scale deployment ecommerce-app-user-service --replicas=5 -n ecommerce

# Scale frontend
kubectl scale deployment ecommerce-app-frontend --replicas=3 -n ecommerce
```

### Auto Scaling (HPA)

Enable autoscaling in values.yaml:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

Then apply:
```bash
helm upgrade ecommerce ./helm-chart -n ecommerce
```

## Monitoring

### Check Pod Status

```bash
# Get all pods
kubectl get pods -n ecommerce

# Watch pods in real-time
kubectl get pods -n ecommerce -w

# Describe a pod
kubectl describe pod <pod-name> -n ecommerce
```

### View Logs

```bash
# View logs for a specific pod
kubectl logs <pod-name> -n ecommerce

# Follow logs
kubectl logs -f <pod-name> -n ecommerce

# View logs for all pods with a label
kubectl logs -l app=user-service -n ecommerce
```

### Check Services

```bash
# Get all services
kubectl get svc -n ecommerce

# Get service details
kubectl describe svc ecommerce-app-frontend -n ecommerce
```

## Database Management

### Access MySQL

```bash
# Get MySQL pod name
kubectl get pods -n ecommerce | grep mysql

# Connect to MySQL
kubectl exec -it <mysql-pod-name> -n ecommerce -- mysql -u root -p

# Run SQL commands
kubectl exec -it <mysql-pod-name> -n ecommerce -- mysql -u root -prootpassword -e "SHOW DATABASES;"
```

### Backup Database

```bash
# Backup all databases
kubectl exec <mysql-pod-name> -n ecommerce -- mysqldump -u root -prootpassword --all-databases > backup.sql

# Restore database
kubectl exec -i <mysql-pod-name> -n ecommerce -- mysql -u root -prootpassword < backup.sql
```

## Troubleshooting

### Pods in CrashLoopBackOff

```bash
# Check pod logs
kubectl logs <pod-name> -n ecommerce

# Check previous logs
kubectl logs <pod-name> -n ecommerce --previous

# Describe pod for events
kubectl describe pod <pod-name> -n ecommerce
```

### Service Not Accessible

```bash
# Check if service exists
kubectl get svc -n ecommerce

# Check endpoints
kubectl get endpoints -n ecommerce

# Test service internally
kubectl run -it --rm debug --image=busybox --restart=Never -n ecommerce -- wget -O- http://ecommerce-app-api-gateway:8000
```

### Image Pull Errors

```bash
# For Minikube, ensure images are loaded
minikube image ls | grep ecommerce

# Reload images if needed
minikube image load <image-name>:latest
```

### Database Connection Issues

```bash
# Check MySQL service
kubectl get svc ecommerce-app-mysql -n ecommerce

# Test MySQL connection
kubectl run -it --rm mysql-client --image=mysql:8.0 --restart=Never -n ecommerce -- mysql -h ecommerce-app-mysql -u root -prootpassword
```

## Cleanup

### Uninstall Application

```bash
# Uninstall Helm release
helm uninstall ecommerce -n ecommerce

# Delete namespace
kubectl delete namespace ecommerce
```

### Stop Kubernetes Cluster

**Minikube:**
```bash
minikube stop
minikube delete
```

**Kind:**
```bash
kind delete cluster --name ecommerce
```

## Production Deployment

### 1. Use Container Registry

Push images to a registry:

```bash
# Tag images
docker tag user-service:latest your-registry/user-service:v1.0.0
docker tag product-service:latest your-registry/product-service:v1.0.0
docker tag order-service:latest your-registry/order-service:v1.0.0
docker tag api-gateway:latest your-registry/api-gateway:v1.0.0
docker tag ecommerce-frontend:latest your-registry/ecommerce-frontend:v1.0.0

# Push to registry
docker push your-registry/user-service:v1.0.0
docker push your-registry/product-service:v1.0.0
docker push your-registry/order-service:v1.0.0
docker push your-registry/api-gateway:v1.0.0
docker push your-registry/ecommerce-frontend:v1.0.0
```

Update values.yaml:
```yaml
userService:
  image:
    repository: your-registry/user-service
    tag: v1.0.0
```

### 2. Configure Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: ecommerce.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ecommerce-tls
      hosts:
        - ecommerce.yourdomain.com
```

### 3. Use Secrets for Sensitive Data

```bash
kubectl create secret generic mysql-secret \
  --from-literal=root-password=secure-password \
  -n ecommerce

kubectl create secret generic google-oauth \
  --from-literal=client-id=your-client-id \
  --from-literal=client-secret=your-client-secret \
  -n ecommerce
```

### 4. Enable Monitoring

Install Prometheus and Grafana:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push images
        run: |
          docker build -t ${{ secrets.REGISTRY }}/user-service:${{ github.sha }} ./backend/user-service
          docker push ${{ secrets.REGISTRY }}/user-service:${{ github.sha }}
      
      - name: Deploy with Helm
        run: |
          helm upgrade --install ecommerce ./helm-chart \
            --set userService.image.tag=${{ github.sha }} \
            --namespace ecommerce
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
