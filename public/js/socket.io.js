const socket = io();

// Listen for new notifications
socket.on('new_notification', (data) => {
    // Play notification sound
    const audio = new Audio('/sounds/notification-sound.mp3');
    audio.play();

    // Display notification message
    alert(`You have a new notification from: ${data.incident_type} Incident Reported - ${data.description}`);
    
    // // Optionally, you can add the notification to the UI
    // notifications.push({
    //     user_name: data.user_name,
    //     incident_type: data.incident_type,
    //     description: data.description,
    //     date: new Date().toLocaleDateString(),
    //     time: new Date().toLocaleTimeString()
    // });
});