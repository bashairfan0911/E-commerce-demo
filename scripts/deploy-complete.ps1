# Complete deployment script with monitoring and ArgoCD

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Complete E-commerce Deployment" -ForegroundColor Cyan
Write-Host "Application + Monitoring + GitOps" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Deploy application
Write-Host "Phase 1: Deploying Application..." -ForegroundColor Magenta
& .\scripts\deploy-kind.ps1
Write-Host ""

# Setup monitoring
Write-Host "Phase 2: Setting up Monitoring..." -ForegroundColor Magenta
& .\scripts\setup-monitoring.ps1
Write-Host ""

# Setup ArgoCD
Write-Host "Phase 3: Setting up ArgoCD..." -ForegroundColor Magenta
& .\scripts\setup-argocd.ps1
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Complete Deployment Finished!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your services:" -ForegroundColor Green
Write-Host ""
Write-Host "Application:" -ForegroundColor Yellow
Write-Host "  Frontend:    http://localhost:30300" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:30800" -ForegroundColor White
Write-Host "  PHPMyAdmin:  http://localhost:30080" -ForegroundColor White
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor Yellow
Write-Host "  Grafana:     http://localhost:30900" -ForegroundColor White
Write-Host "  Prometheus:  kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090" -ForegroundColor White
Write-Host ""
Write-Host "GitOps:" -ForegroundColor Yellow
Write-Host "  ArgoCD:      http://localhost:30700" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Login to Grafana and explore dashboards"
Write-Host "2. Login to ArgoCD and view application status"
Write-Host "3. Make changes to your Git repo and watch ArgoCD sync automatically"
Write-Host ""
Write-Host "For detailed documentation, see MONITORING_ARGOCD.md" -ForegroundColor Yellow
