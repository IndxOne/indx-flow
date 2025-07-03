// Script pour forcer le rechargement CSS/JS en cas de problème de cache
console.log('🔄 Force reload script - Clearing all caches...')

// Clear localStorage
localStorage.clear()

// Clear sessionStorage  
sessionStorage.clear()

// Force reload with cache bypass
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
    }
  })
}

// Force hard reload
window.location.reload(true)