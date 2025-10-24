# PowerShell script for setting up ArgoCD

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setting up ArgoCD" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Add Helm repository
Write-Host "Step 1: Adding ArgoCD Helm repository..." -ForegroundColor Yellow
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
Write-Host "Helm repository added" -ForegroundColor Green
Write-Host ""

# Create argocd namespace
Write-Host "Step 2: Creating argocd namespace..." -ForegroundColor Yellow
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
Write-Host "Namespace created" -ForegroundColor Green
Write-Host ""

# Install ArgoCD
Write-Host "Step 3: Installing ArgoCD..." -ForegroundColor Yellow
helm upgrade --install argocd argo/argo-cd --namespace argocd --values argocd/argocd-values.yaml --wait --timeout 10m
Write-Host "ArgoCD installed" -ForegroundColor Green
Write-Host ""

# Wait for pods to be ready
Write-Host "Step 4: Waiting for ArgoCD pods to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all -n argocd --timeout=600s
Write-Host "All ArgoCD pods are ready" -ForegroundColor Green
Write-Host ""

# Get ArgoCD admin password
Write-Host "Step 5: Getting ArgoCD admin password..." -ForegroundColor Yellow
$ARGOCD_PASSWORD = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
Write-Host "Password retrieved" -ForegroundColor Green
Write-Host ""

# Apply application
Write-Host "Step 6: Applying ArgoCD application..." -ForegroundColor Yellow
kubectl apply -f argocd/application.yaml
Write-Host "Application configured" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ArgoCD Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access ArgoCD:" -ForegroundColor Green
Write-Host "  URL:      http://localhost:30700" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: $ARGOCD_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  Check apps:  kubectl get applications -n argocd"
Write-Host "  View logs:   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server"
