#!/bin/bash

# Cleanup Kind cluster

echo "Cleaning up Kind cluster..."

# Delete the Kind cluster
if kind get clusters | grep -q "ecommerce"; then
    echo "Deleting Kind cluster 'ecommerce'..."
    kind delete cluster --name ecommerce
    echo "✓ Cluster deleted successfully"
else
    echo "No cluster named 'ecommerce' found"
fi

echo "Cleanup complete!"
