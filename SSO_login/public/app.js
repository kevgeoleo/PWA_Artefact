// Register Service Worker
// first check whether browser supports service workers - using the if statement 
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("SW Registration Failed:", err));
}
