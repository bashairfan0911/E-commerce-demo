# Monitoring and GitOps Setup Guide

Complete guide for setting up Prometheus, Grafana, and ArgoCD for your e-commerce application.

## Overview

This setup includes:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **ArgoCD**: GitOps continuous delivery

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kind Cluster                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   ArgoCD     │  │  Prometheus  │  │   Grafana    │   │
│  │  (GitOps)    │  │  (Metrics)   │  │ (Dashboards) │   │
│  │  Port 30700  │  │  Port 9090   │  │  Port 30900  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │         E-commerce Application                  │    │
│  │  Frontend | API Gateway | Services | Database   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Setup Monitoring (Prometheus + Grafana)

**Windows:**
```powershell
.\scripts\setup-monitoring.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-monitoring.sh
./scripts/setup-monitoring.sh
```

### 2. Setup ArgoCD

**Windows:**
```powershell
.\scripts\setup-argocd.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-argocd.sh
./scripts/setup-argocd.sh
```

## Access URLs

After setup, access the services:

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **Grafana** | http://localhost:30900 | admin / (see output) |
| **ArgoCD** | http://localhost:30700 | admin / (see output) |
| **Prometheus** | Port-forward required | N/A |

## Detailed Setup

### Prometheus Setup

Prometheus collects metrics from your application and Kubernetes cluster.

**Features:**
- Automatic service discovery
- 30-day metric retention
- Persistent storage (10Gi)
- AlertManager integration

**Access Prometheus:**
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```
Then open: http://localhost:9090

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

### Grafana Setup

Grafana provides visualization dashboards for your metrics.

**Features:**
- Pre-configured Prometheus datasource
- Custom e-commerce dashboard
- Persistent storage (5Gi)
- NodePort access on 30900

**Access Grafana:**
```
URL: http://localhost:30900
Username: admin
Password: (shown in setup output)
```

**Available Dashboards:**
1. **Kubernetes / Compute Resources / Cluster** - Overall cluster metrics
2. **Kubernetes / Compute Resources / Namespace (Pods)** - Pod-level metrics
3. **E-commerce Application Dashboard** - Custom application metrics

**Creating Custom Dashboards:**
1. Login to Grafana
2. Click "+" → "Dashboard"
3. Add Panel
4. Select Prometheus datasource
5. Enter PromQL query
6. Configure visualization

**Example Panel Queries:**
```promql
# Frontend Response Time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="frontend"}[5m]))

# API Gateway Request Rate
rate(http_requests_total{service="api-gateway"}[5m])

# Database Connections
mysql_global_status_threads_connected{namespace="ecommerce"}
```

### ArgoCD Setup

ArgoCD provides GitOps continuous delivery for your application.

**Features:**
- Automated sync from Git repository
- Self-healing deployments
- Rollback capabilities
- Web UI and CLI

**Access ArgoCD:**
```
URL: http://localhost:30700
Username: admin
Password: (shown in setup output)
```

**ArgoCD Application Configuration:**
- **Repository**: https://github.com/bashairfan0911/E-commerce-demo.git
- **Branch**: devops
- **Path**: helm-chart
- **Sync Policy**: Automated with self-heal

**Using ArgoCD:**

1. **View Application Status:**
```bash
kubectl get applications -n argocd
```

2. **Sync Application Manually:**
```bash
argocd app sync ecommerce-app
```

3. **View Sync History:**
```bash
argocd app history ecommerce-app
```

4. **Rollback to Previous Version:**
```bash
argocd app rollback ecommerce-app <revision-number>
```

## Monitoring Your Application

### Key Metrics to Monitor

**1. Application Health:**
- Pod status and restarts
- Container resource usage
- Application errors and logs

**2. Performance:**
- Request rate and latency
- Database query performance
- API response times

**3. Infrastructure:**
- Node CPU and memory
- Disk usage
- Network traffic

### Setting Up Alerts

Create alert rules in Prometheus:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: ecommerce-alerts
  namespace: monitoring
spec:
  groups:
  - name: ecommerce
    interval: 30s
    rules:
    - alert: HighPodMemory
      expr: container_memory_usage_bytes{namespace="ecommerce"} > 500000000
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage in {{ $labels.pod }}"
    
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total{namespace="ecommerce"}[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} is crash looping"
```

Apply alerts:
```bash
kubectl apply -f monitoring/alerts.yaml
```

## GitOps Workflow with ArgoCD

### 1. Make Changes to Your Application

Edit files in your Git repository:
```bash
# Edit Helm values
nano helm-chart/values.yaml

# Commit changes
git add .
git commit -m "Update application configuration"
git push origin devops
```

### 2. ArgoCD Automatically Syncs

ArgoCD detects changes and syncs automatically (if auto-sync is enabled).

### 3. Monitor Deployment

Watch the deployment in ArgoCD UI or CLI:
```bash
argocd app get ecommerce-app
argocd app wait ecommerce-app
```

### 4. Verify in Kubernetes

```bash
kubectl get pods -n ecommerce
kubectl rollout status deployment/ecommerce-app-frontend -n ecommerce
```

## Troubleshooting

### Prometheus Issues

**Prometheus not scraping metrics:**
```bash
# Check service monitors
kubectl get servicemonitors -n ecommerce

# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Visit http://localhost:9090/targets
```

**High memory usage:**
```bash
# Reduce retention period in values
prometheus:
  prometheusSpec:
    retention: 7d  # Reduce from 30d
```

### Grafana Issues

**Cannot login:**
```bash
# Reset admin password
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

**Dashboards not showing data:**
1. Check Prometheus datasource connection
2. Verify metrics are being collected
3. Check time range in dashboard

### ArgoCD Issues

**Application out of sync:**
```bash
# Force sync
argocd app sync ecommerce-app --force

# Check sync status
argocd app get ecommerce-app
```

**Cannot access ArgoCD UI:**
```bash
# Check ArgoCD pods
kubectl get pods -n argocd

# Port forward if NodePort not working
kubectl port-forward -n argocd svc/argocd-server 8080:443
```

**Forgot admin password:**
```bash
# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
```

## Best Practices

### Monitoring

1. **Set up alerts** for critical metrics
2. **Create custom dashboards** for your application
3. **Monitor trends** over time, not just current values
4. **Set appropriate retention** based on your needs
5. **Use labels** to organize metrics

### GitOps with ArgoCD

1. **Use branches** for different environments (dev, staging, prod)
2. **Enable auto-sync** for development, manual for production
3. **Use sync waves** for ordered deployments
4. **Test changes** in lower environments first
5. **Keep secrets** in Kubernetes Secrets, not Git

### Resource Management

1. **Set resource limits** for monitoring components
2. **Use persistent storage** for metrics and dashboards
3. **Monitor monitoring** - watch Prometheus/Grafana resource usage
4. **Clean up old data** periodically

## Cleanup

### Remove Monitoring Stack

```bash
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring
```

### Remove ArgoCD

```bash
helm uninstall argocd -n argocd
kubectl delete namespace argocd
```

## Advanced Configuration

### Custom Metrics

Add custom metrics to your application:

**Python (Flask) Example:**
```python
from prometheus_client import Counter, Histogram, generate_latest

# Define metrics
request_count = Counter('http_requests_total', 'Total HTTP requests')
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.route('/metrics')
def metrics():
    return generate_latest()
```

### Multi-Environment Setup

Create separate ArgoCD applications for each environment:

```yaml
# argocd/application-dev.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ecommerce-dev
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/bashairfan0911/E-commerce-demo.git
    targetRevision: develop
    path: helm-chart
  destination:
    namespace: ecommerce-dev
```

### Slack Notifications

Configure AlertManager to send alerts to Slack:

```yaml
alertmanager:
  config:
    receivers:
    - name: 'slack'
      slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
```

## Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Monitoring Best Practices](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)
