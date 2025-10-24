# PowerShell script for setting up monitoring stack

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setting up Monitoring Stack" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Add Helm repositories
Write-Host "Step 1: Adding Helm repositories..." -ForegroundColor Yellow
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
Write-Host "Helm repositories added" -ForegroundColor Green
Write-Host ""

# Create monitoring namespace
Write-Host "Step 2: Creating monitoring namespace..." -ForegroundColor Yellow
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
Write-Host "Namespace created" -ForegroundColor Green
Write-Host ""

# Install Prometheus Stack
Write-Host "Step 3: Installing Prometheus and Grafana..." -ForegroundColor Yellow
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --values monitoring/prometheus-values.yaml --wait --timeout 10m
Write-Host "Prometheus and Grafana installed" -ForegroundColor Green
Write-Host ""

# Wait for pods to be ready
Write-Host "Step 4: Waiting for monitoring pods to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all -n monitoring --timeout=600s
Write-Host "All monitoring pods are ready" -ForegroundColor Green
Write-Host ""

# Apply service monitors
Write-Host "Step 5: Applying service monitors..." -ForegroundColor Yellow
kubectl apply -f monitoring/servicemonitor.yaml
Write-Host "Service monitors applied" -ForegroundColor Green
Write-Host ""

# Apply Grafana dashboards
Write-Host "Step 6: Applying Grafana dashboards..." -ForegroundColor Yellow
kubectl apply -f monitoring/grafana-dashboards.yaml
Write-Host "Grafana dashboards applied" -ForegroundColor Green
Write-Host ""

# Get Grafana admin password
$GRAFANA_PASSWORD = kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Monitoring Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the services:" -ForegroundColor Green
Write-Host "  Grafana:    http://localhost:30900" -ForegroundColor White
Write-Host "  Username:   admin" -ForegroundColor White
Write-Host "  Password:   $GRAFANA_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "  Prometheus: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090" -ForegroundColor White
Write-Host "  Then access: http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  Check pods:  kubectl get pods -n monitoring"
Write-Host "  View logs:   kubectl logs -n monitoring -l app.kubernetes.io/name=grafana"
