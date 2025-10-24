#!/bin/bash

set -e

echo "=========================================="
echo "Setting up Monitoring Stack"
echo "=========================================="
echo ""

# Add Helm repositories
echo "Step 1: Adding Helm repositories..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
echo "✓ Helm repositories added"
echo ""

# Create monitoring namespace
echo "Step 2: Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Namespace created"
echo ""

# Install Prometheus Stack (includes Grafana)
echo "Step 3: Installing Prometheus and Grafana..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --values monitoring/prometheus-values.yaml \
    --wait \
    --timeout 10m
echo "✓ Prometheus and Grafana installed"
echo ""

# Wait for pods to be ready
echo "Step 4: Waiting for monitoring pods to be ready..."
kubectl wait --for=condition=ready pod --all -n monitoring --timeout=600s
echo "✓ All monitoring pods are ready"
echo ""

# Apply service monitors
echo "Step 5: Applying service monitors..."
kubectl apply -f monitoring/servicemonitor.yaml
echo "✓ Service monitors applied"
echo ""

# Apply Grafana dashboards
echo "Step 6: Applying Grafana dashboards..."
kubectl apply -f monitoring/grafana-dashboards.yaml
echo "✓ Grafana dashboards applied"
echo ""

# Get Grafana admin password
GRAFANA_PASSWORD=$(kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode)

echo "=========================================="
echo "Monitoring Setup Complete!"
echo "=========================================="
echo ""
echo "Access the services:"
echo "  Grafana:    http://localhost:30900"
echo "  Username:   admin"
echo "  Password:   $GRAFANA_PASSWORD"
echo ""
echo "  Prometheus: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"
echo "  Then access: http://localhost:9090"
echo ""
echo "Useful commands:"
echo "  Check pods:  kubectl get pods -n monitoring"
echo "  View logs:   kubectl logs -n monitoring -l app.kubernetes.io/name=grafana"
