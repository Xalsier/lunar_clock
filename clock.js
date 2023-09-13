window.onload = function() {
    const clockDiv = document.getElementById('clockContainer');

    function updateTime() {
        const now = new Date();

        // Get Tokyo time using the Intl.DateTimeFormat API
        const tokyoTime = new Intl.DateTimeFormat('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true, 
            timeZone: 'Asia/Tokyo' 
        }).format(now);

        clockDiv.textContent = tokyoTime;

        // Request the next frame
        requestAnimationFrame(updateTime);
    }

    // Start the loop
    updateTime();
}
