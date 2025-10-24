# Access Guide - All Services

Quick reference for accessing all deployed services in your e-commerce platform.

## Service URLs

### Application Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:30300 | E-commerce web application |
| **API Gateway** | http://localhost:30800 | Backend REST API |
| **PHPMyAdmin** | http://localhost:30080 | Database management interface |

### Monitoring & GitOps

| Service | URL | Purpose |
|---------|-----|---------|
| **Grafana** | http://localhost:30900 | Monitoring dashboards |
| **Prometheus** | http://localhost:30909 | Metrics and alerts |
| **ArgoCD** | http://localhost:30700 | GitOps deployment UI |

## Default Credentials

### Grafana
```
URL: http://localhost:30900
Username: admin
Password: admin
```

### ArgoCD
```
URL: http://localhost:30700
Username: admin
Password: Get with command below
```

**Get ArgoCD Password:**
```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

### PHPMyAdmin
```
URL: http://localhost:30080
Username: root
Password: rootpassword
```

## Quick Commands

### Check Application Status
```bash
# All pods
kubectl get pods -n ecommerce

# All services
kubectl get svc -n ecommerce

# ArgoCD application
kubectl get app -n argocd
```

### View Logs
```bash
# Frontend logs
kubectl logs -l app=frontend -n ecommerce

# API Gateway logs
kubectl logs -l app=api-gateway -n ecommerce

# All application logs
kubectl logs -l app -n ecommerce --all-containers=true
```

### Monitoring
```bash
# Grafana pods
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana

# Prometheus pods
kubectl get pods -n monitoring -l app.kubernetes.io/name=prometheus

# All monitoring services
kubectl get svc -n monitoring
```

### ArgoCD Operations
```bash
# View application status
kubectl get app ecommerce-app -n argocd

# View sync history
kubectl describe app ecommerce-app -n argocd

# Force sync
kubectl patch app ecommerce-app -n argocd --type merge -p '{"operation":{"sync":{}}}'
```

## Port Mappings

| Internal Port | External Port | Service |
|---------------|---------------|---------|
| 3000 | 30300 | Frontend |
| 8000 | 30800 | API Gateway |
| 80 | 30080 | PHPMyAdmin |
| 80 | 30700 | ArgoCD |
| 3000 | 30900 | Grafana |
| 9090 | 30909 | Prometheus |

## Troubleshooting

### Service Not Accessible

1. **Check if pods are running:**
```bash
kubectl get pods -n ecommerce
```

2. **Check service endpoints:**
```bash
kubectl get endpoints -n ecommerce
```

3. **Check service configuration:**
```bash
kubectl describe svc <service-name> -n ecommerce
```

### Port Already in Use

If you get "port already allocated" errors:

1. **Check existing services:**
```bash
kubectl get svc --all-namespaces | grep NodePort
```

2. **Delete conflicting services:**
```bash
kubectl delete svc <service-name> -n <namespace>
```

### ArgoCD Not Syncing

1. **Check application status:**
```bash
kubectl get app ecommerce-app -n argocd -o yaml
```

2. **View controller logs:**
```bash
kubectl logs -n argocd argocd-application-controller-0
```

3. **Force refresh:**
```bash
kubectl patch app ecommerce-app -n argocd --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```

### Grafana Not Loading

1. **Check Grafana pod:**
```bash
kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana
```

2. **View logs:**
```bash
kubectl logs -n monitoring -l app.kubernetes.io/name=grafana -c grafana
```

3. **Restart Grafana:**
```bash
kubectl rollout restart deployment/prometheus-grafana -n monitoring
```

## Testing the Application

### 1. Access Frontend
Open http://localhost:30300 in your browser

### 2. Register a User
- Click "Register"
- Fill in user details
- Submit

### 3. Browse Products
- View product catalog
- Add items to cart

### 4. Place an Order
- Go to cart
- Proceed to checkout
- Fill in shipping details
- Complete order

### 5. View in PHPMyAdmin
- Open http://localhost:30080
- Login with root/rootpassword
- Check databases:
  - `user_service_db` - Users table
  - `product_service_db` - Products table
  - `order_service_db` - Orders and order_items tables

## Monitoring Your Application

### Grafana Dashboards

1. **Login to Grafana** (http://localhost:30900)
2. **Navigate to Dashboards**
3. **Available Dashboards:**
   - Kubernetes / Compute Resources / Cluster
   - Kubernetes / Compute Resources / Namespace (Pods)
   - Kubernetes / Networking / Cluster

### Prometheus Queries

Access Prometheus at http://localhost:30909

**Useful Queries:**
```promql
# CPU usage by pod
sum(rate(container_cpu_usage_seconds_total{namespace="ecommerce"}[5m])) by (pod)

# Memory usage by pod
sum(container_memory_usage_bytes{namespace="ecommerce"}) by (pod)

# Pod count
count(kube_pod_info{namespace="ecommerce"})

# Pod restarts
sum(kube_pod_container_status_restarts_total{namespace="ecommerce"}) by (pod)
```

### ArgoCD Monitoring

1. **Login to ArgoCD** (http://localhost:30700)
2. **View Application:**
   - Click on "ecommerce-app"
   - See deployment status
   - View resource tree
   - Check sync status

## GitOps Workflow

### Making Changes

1. **Edit configuration in Git:**
```bash
git checkout devops
nano helm-chart/values.yaml
git commit -am "Update configuration"
git push origin devops
```

2. **ArgoCD automatically syncs** (within 3 minutes)

3. **Monitor deployment:**
   - Watch in ArgoCD UI
   - Or use: `kubectl get app ecommerce-app -n argocd -w`

### Manual Sync

If you want to sync immediately:
```bash
kubectl patch app ecommerce-app -n argocd --type merge -p '{"operation":{"sync":{}}}'
```

## Scaling

### Scale Deployments
```bash
# Scale frontend to 5 replicas
kubectl scale deployment ecommerce-app-frontend --replicas=5 -n ecommerce

# Scale all services
kubectl scale deployment --all --replicas=3 -n ecommerce
```

### Check Scaling
```bash
kubectl get pods -n ecommerce -l app=frontend
```

## Cleanup

### Remove Application Only
```bash
# Via ArgoCD
kubectl delete app ecommerce-app -n argocd

# Or via Helm
helm uninstall ecommerce -n ecommerce
```

### Remove Everything
```bash
# Delete entire cluster
kind delete cluster --name ecommerce
```

## Additional Resources

- [QUICK_START.md](QUICK_START.md) - Quick deployment guide
- [KIND_DEPLOYMENT.md](KIND_DEPLOYMENT.md) - Detailed Kind setup
- [MONITORING_ARGOCD.md](MONITORING_ARGOCD.md) - Monitoring and GitOps guide
- [README.md](README.md) - Application overview

## Support

For issues:
1. Check pod logs: `kubectl logs <pod-name> -n <namespace>`
2. Check events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`
3. Describe resources: `kubectl describe <resource-type> <resource-name> -n <namespace>`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    localhost (Your Machine)                  │
│                                                              │
│  Port 30300 ──► Frontend                                    │
│  Port 30800 ──► API Gateway                                 │
│  Port 30080 ──► PHPMyAdmin                                  │
│  Port 30700 ──► ArgoCD                                      │
│  Port 30900 ──► Grafana                                     │
│  Port 30909 ──► Prometheus                                  │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kind Cluster                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Namespace: ecommerce                   │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │    │
│  │  │Front │ │  API │ │ User │ │Product│ │Order│   │    │
│  │  │ end  │ │Gateway│ │Service│ │Service│ │Svc │   │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │    │
│  │                    ┌──────┐                        │    │
│  │                    │MySQL │                        │    │
│  │                    └──────┘                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            Namespace: monitoring                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │Prometheus│  │ Grafana  │  │AlertMgr  │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Namespace: argocd                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │  Server  │  │RepoServer│  │Controller│        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

Happy deploying! 🚀
