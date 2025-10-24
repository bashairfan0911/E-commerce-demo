# E-commerce Microservices Helm Chart

This Helm chart deploys a complete e-commerce microservices application on Kubernetes.

## Architecture

- **Frontend**: React application (Port 3000)
- **API Gateway**: Routes requests to services (Port 8000)
- **User Service**: Authentication & user management (Port 8001)
- **Product Service**: Product catalog (Port 8002)
- **Order Service**: Order processing (Port 8003)
- **MySQL**: Database for all services (Port 3306)
- **PHPMyAdmin**: Database management UI (Port 8080)

## Prerequisites

- Kubernetes cluster (v1.19+)
- Helm 3.x
- kubectl configured
- Docker images built and available

## Building Docker Images

Before deploying, build all Docker images:

```bash
# Build backend services
docker build -t user-service:latest ./backend/user-service
docker build -t product-service:latest ./backend/product-service
docker build -t order-service:latest ./backend/order-service
docker build -t api-gateway:latest ./backend/api-gateway

# Build frontend
docker build -t ecommerce-frontend:latest ./frontend
```

## Installation

### 1. Install the Helm chart

```bash
# Install with default values
helm install ecommerce ./helm-chart

# Install with custom values
helm install ecommerce ./helm-chart -f custom-values.yaml

# Install in a specific namespace
helm install ecommerce ./helm-chart --namespace ecommerce --create-namespace
```

### 2. Configure Google OAuth

Update the values.yaml with your Google OAuth credentials:

```yaml
userService:
  env:
    googleClientId: "your-actual-client-id.apps.googleusercontent.com"

frontend:
  env:
    googleClientId: "your-actual-client-id.apps.googleusercontent.com"
```

### 3. Access the Application

After deployment, access the services:

- **Frontend**: http://localhost:30300
- **API Gateway**: http://localhost:30800
- **PHPMyAdmin**: http://localhost:30080

## Configuration

### Key Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `mysql.rootPassword` | MySQL root password | `rootpassword` |
| `mysql.persistence.enabled` | Enable persistent storage | `true` |
| `mysql.persistence.size` | Storage size | `10Gi` |
| `userService.replicaCount` | Number of user service replicas | `2` |
| `productService.replicaCount` | Number of product service replicas | `2` |
| `orderService.replicaCount` | Number of order service replicas | `2` |
| `apiGateway.replicaCount` | Number of API gateway replicas | `2` |
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |

### Custom Values Example

Create a `custom-values.yaml`:

```yaml
mysql:
  rootPassword: "secure-password"
  persistence:
    size: 20Gi

userService:
  replicaCount: 3
  env:
    googleClientId: "123456789-abc.apps.googleusercontent.com"

frontend:
  replicaCount: 3
  env:
    apiUrl: "http://api.example.com/api"
    googleClientId: "123456789-abc.apps.googleusercontent.com"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade ecommerce ./helm-chart

# Upgrade with custom values file
helm upgrade ecommerce ./helm-chart -f custom-values.yaml
```

## Uninstalling

```bash
# Uninstall the release
helm uninstall ecommerce

# Uninstall from specific namespace
helm uninstall ecommerce --namespace ecommerce
```

## Monitoring

Check the status of your deployment:

```bash
# Check Helm release status
helm status ecommerce

# Check pods
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=frontend
kubectl logs -l app=api-gateway
kubectl logs -l app=user-service
```

## Troubleshooting

### Pods not starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Database connection issues

```bash
# Check MySQL pod
kubectl get pod -l app=mysql

# Check MySQL logs
kubectl logs -l app=mysql

# Test database connection
kubectl exec -it <mysql-pod-name> -- mysql -u root -p
```

### Service not accessible

```bash
# Check service endpoints
kubectl get endpoints

# Port forward for testing
kubectl port-forward svc/ecommerce-app-frontend 3000:3000
kubectl port-forward svc/ecommerce-app-api-gateway 8000:8000
```

## Production Considerations

1. **Secrets Management**: Use Kubernetes Secrets for sensitive data
2. **Ingress**: Enable ingress for production domains
3. **TLS/SSL**: Configure TLS certificates
4. **Autoscaling**: Enable HPA for automatic scaling
5. **Monitoring**: Add Prometheus/Grafana for monitoring
6. **Backup**: Configure database backups
7. **Resource Limits**: Adjust based on load testing

## Enabling Ingress

Update values.yaml:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: ecommerce.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ecommerce-tls
      hosts:
        - ecommerce.example.com
```

## Autoscaling

Enable HPA in values.yaml:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Support

For issues and questions, please refer to the main project README.
