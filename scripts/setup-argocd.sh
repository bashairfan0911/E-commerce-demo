#!/bin/bash

set -e

echo "=========================================="
echo "Setting up ArgoCD"
echo "=========================================="
echo ""

# Add Helm repository
echo "Step 1: Adding ArgoCD Helm repository..."
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
echo "✓ Helm repository added"
echo ""

# Create argocd namespace
echo "Step 2: Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Namespace created"
echo ""

# Install ArgoCD
echo "Step 3: Installing ArgoCD..."
helm upgrade --install argocd argo/argo-cd \
    --namespace argocd \
    --values argocd/argocd-values.yaml \
    --wait \
    --timeout 10m
echo "✓ ArgoCD installed"
echo ""

# Wait for pods to be ready
echo "Step 4: Waiting for ArgoCD pods to be ready..."
kubectl wait --for=condition=ready pod --all -n argocd --timeout=600s
echo "✓ All ArgoCD pods are ready"
echo ""

# Get ArgoCD admin password
echo "Step 5: Getting ArgoCD admin password..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode)
echo "✓ Password retrieved"
echo ""

# Apply application
echo "Step 6: Applying ArgoCD application..."
kubectl apply -f argocd/application.yaml
echo "✓ Application configured"
echo ""

echo "=========================================="
echo "ArgoCD Setup Complete!"
echo "=========================================="
echo ""
echo "Access ArgoCD:"
echo "  URL:      http://localhost:30700"
echo "  Username: admin"
echo "  Password: $ARGOCD_PASSWORD"
echo ""
echo "Useful commands:"
echo "  Check apps:  kubectl get applications -n argocd"
echo "  Sync app:    kubectl -n argocd patch application ecommerce-app -p '{\"spec\":{\"syncPolicy\":{\"automated\":{\"prune\":true}}}}' --type merge"
echo "  View logs:   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server"
