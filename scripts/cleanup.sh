#!/bin/bash

# Cleanup e-commerce deployment

echo "Cleaning up e-commerce deployment..."

# Uninstall Helm release
echo "Uninstalling Helm release..."
helm uninstall ecommerce -n ecommerce

# Delete namespace
echo "Deleting namespace..."
kubectl delete namespace ecommerce

# Delete PVCs if they exist
echo "Cleaning up persistent volumes..."
kubectl delete pvc --all -n ecommerce 2>/dev/null || true

echo "Cleanup complete!"
