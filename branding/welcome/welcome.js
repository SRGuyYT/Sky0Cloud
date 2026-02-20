// 1. Session Bypass: If user is logged in, snap to home
if (localStorage.getItem("mx_access_token")) {
    window.parent.location.hash = "#/home";
}

// 2. Notification Request
function requestNotifications() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Sky0Cloud Notifications Enabled!");
        }
    });
}

// 3. Dynamic Background Refresh
console.log("Sky0Cloud v4 UI Loaded Successfully");
