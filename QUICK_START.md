# Quick Start Guide

Get your complete e-commerce platform running with monitoring and GitOps in minutes!

## Prerequisites

- Docker Desktop installed and running
- Kind installed
- kubectl installed
- Helm installed

## One-Command Deployment

### Windows (PowerShell)
```powershell
.\scripts\deploy-complete.ps1
```

This single command will:
1. ✅ Create Kind cluster with 3 nodes
2. ✅ Build and deploy e-commerce application
3. ✅ Install Prometheus and Grafana for monitoring
4. ✅ Setup ArgoCD for GitOps

**Estimated time:** 10-15 minutes

## Access Your Platform

After deployment completes, access these services:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:30300 | E-commerce web application |
| **API Gateway** | http://localhost:30800 | Backend API |
| **PHPMyAdmin** | http://localhost:30080 | Database management |
| **Grafana** | http://localhost:30900 | Monitoring dashboards |
| **ArgoCD** | http://localhost:30700 | GitOps deployment |

## Default Credentials

**Grafana:**
- Username: `admin`
- Password: (shown in deployment output)

**ArgoCD:**
- Username: `admin`
- Password: (shown in deployment output)

**PHPMyAdmin:**
- Username: `root`
- Password: `rootpassword`

## Step-by-Step Deployment

If you prefer to deploy components separately:

### 1. Deploy Application Only
```powershell
.\scripts\deploy-kind.ps1
```

### 2. Add Monitoring
```powershell
.\scripts\setup-monitoring.ps1
```

### 3. Add GitOps
```powershell
.\scripts\setup-argocd.ps1
```

## Verify Deployment

Check all pods are running:
```bash
# Application pods
kubectl get pods -n ecommerce

# Monitoring pods
kubectl get pods -n monitoring

# ArgoCD pods
kubectl get pods -n argocd
```

## Quick Commands

### Application Management
```bash
# View application logs
kubectl logs -l app=frontend -n ecommerce

# Scale frontend
kubectl scale deployment ecommerce-app-frontend --replicas=3 -n ecommerce

# Restart a service
kubectl rollout restart deployment/ecommerce-app-user-service -n ecommerce
```

### Monitoring
```bash
# Access Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# View Grafana password
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

### GitOps
```bash
# View ArgoCD applications
kubectl get applications -n argocd

# Sync application manually
kubectl -n argocd patch application ecommerce-app -p '{"spec":{"syncPolicy":{"automated":{"prune":true}}}}' --type merge

# View ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
```

## Making Changes

### Update Application via GitOps

1. Edit configuration in Git:
```bash
git checkout devops
nano helm-chart/values.yaml
git commit -am "Update configuration"
git push origin devops
```

2. ArgoCD automatically detects and syncs changes
3. Monitor deployment in ArgoCD UI

### Manual Updates

```bash
# Update Helm values
helm upgrade ecommerce ./helm-chart -n ecommerce --set frontend.replicaCount=3

# Rebuild and update image
docker build -t ecommerce-frontend:latest ./frontend
kind load docker-image ecommerce-frontend:latest --name ecommerce
kubectl rollout restart deployment/ecommerce-app-frontend -n ecommerce
```

## Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce
```

### Service Not Accessible
```bash
# Check services
kubectl get svc -n ecommerce

# Port forward if NodePort not working
kubectl port-forward -n ecommerce svc/ecommerce-app-frontend 3000:3000
```

### Monitoring Issues
```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit http://localhost:9090/targets

# Restart Grafana
kubectl rollout restart deployment/prometheus-grafana -n monitoring
```

## Cleanup

### Remove Everything
```bash
kind delete cluster --name ecommerce
```

### Remove Specific Components
```bash
# Remove application only
helm uninstall ecommerce -n ecommerce

# Remove monitoring
helm uninstall prometheus -n monitoring

# Remove ArgoCD
helm uninstall argocd -n argocd
```

## What's Next?

1. **Explore Grafana Dashboards**
   - View application metrics
   - Create custom dashboards
   - Set up alerts

2. **Configure ArgoCD**
   - Connect to your Git repository
   - Set up automated deployments
   - Configure sync policies

3. **Customize Application**
   - Update Google OAuth credentials
   - Modify product catalog
   - Add new features

4. **Production Deployment**
   - Use real Kubernetes cluster (EKS, GKE, AKS)
   - Configure ingress with SSL
   - Set up proper secrets management
   - Enable autoscaling

## Documentation

- [KIND_DEPLOYMENT.md](KIND_DEPLOYMENT.md) - Detailed Kind deployment guide
- [MONITORING_ARGOCD.md](MONITORING_ARGOCD.md) - Monitoring and GitOps guide
- [KUBERNETES_DEPLOYMENT.md](KUBERNETES_DEPLOYMENT.md) - General Kubernetes guide
- [README.md](README.md) - Application overview

## Support

For issues or questions:
1. Check the troubleshooting sections in documentation
2. View pod logs: `kubectl logs <pod-name> -n <namespace>`
3. Check events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Kind Cluster                           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Monitoring Stack                      │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │     │
│  │  │Prometheus│  │ Grafana  │  │ AlertMgr │          │     │
│  │  └──────────┘  └──────────┘  └──────────┘          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              GitOps (ArgoCD)                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │  Server  │  │RepoServer│  │Controller│          │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         E-commerce Application                      │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │    │
│  │  │Front │ │  API │ │ User │ │Product│ │Order│   │    │
│  │  │ end  │ │Gateway│ │Service│ │Service│ │Svc │   │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │    │
│  │                    ┌──────┐                        │    │
│  │                    │MySQL │                        │    │
│  │                    └──────┘                        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

Happy deploying! 🚀
