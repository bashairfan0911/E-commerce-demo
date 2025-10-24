# PowerShell script for cleaning up Kind cluster

Write-Host "Cleaning up Kind cluster..." -ForegroundColor Yellow

# Delete the Kind cluster
$existingCluster = kind get clusters | Select-String "ecommerce"
if ($existingCluster) {
    Write-Host "Deleting Kind cluster 'ecommerce'..." -ForegroundColor Yellow
    kind delete cluster --name ecommerce
    Write-Host "✓ Cluster deleted successfully" -ForegroundColor Green
} else {
    Write-Host "No cluster named 'ecommerce' found" -ForegroundColor Yellow
}

Write-Host "Cleanup complete!" -ForegroundColor Green
