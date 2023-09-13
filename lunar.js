// Constants
const RAD_TO_DEG = 180 / Math.PI;
const AFTER_TWILIGHT = 'AT';
const HIGH_MOON = 'HM';
const DEGREE_SEGMENT = 15;
const TICK_MULTIPLIER = 100;
const ALTITUDE_OFFSET = 12;  // The altitude offset
let applyAltitudeOffset = false;

// Dependencies
const SUN_CALC = SunCalc;  // Important library for moon position calculations
let prevAltitude = null;

let showTicks = true; // True/False switch to show or hide the ticks
let moonClockEnabled = false;
const moonData = {
    latitude_degrees: 35.6895,
    longitude_degrees: 139.6917,
};

const altitudeHelper = {
    segment: altitude => Math.floor(altitude / DEGREE_SEGMENT),
    degree: altitude => Math.floor(altitude % DEGREE_SEGMENT),
    tick: altitude => Math.round((altitude % 1) * TICK_MULTIPLIER),
};

const moonAltitudeElement = document.getElementById('moonAltitude');

function getTokyoTime() {
    const now = new Date();

    // Get Tokyo time using the Intl.DateTimeFormat API
    const tokyoDateTime = new Intl.DateTimeFormat('en-US', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo'
    }).formatToParts(now);
    
    const tokyoDate = new Date(
        +tokyoDateTime.find(p => p.type === "year").value,
        +tokyoDateTime.find(p => p.type === "month").value - 1,
        +tokyoDateTime.find(p => p.type === "day").value,
        +tokyoDateTime.find(p => p.type === "hour").value,
        +tokyoDateTime.find(p => p.type === "minute").value,
        +tokyoDateTime.find(p => p.type === "second").value
    );

    return tokyoDate;
}

function updateMoonAltitude() {
    const now = getTokyoTime(); // Use the Tokyo time function
    let altitude;

    try {
        const moonPosition = SUN_CALC.getMoonPosition(now, moonData.latitude_degrees, moonData.longitude_degrees);
        if (Math.abs(moonPosition.altitude) > Math.PI / 2) {
            throw new Error('Invalid altitude value returned by the library.');
        }
        altitude = Math.abs(moonPosition.altitude * RAD_TO_DEG);
        if (applyAltitudeOffset) {
            altitude += ALTITUDE_OFFSET;  // Apply the altitude offset
        }
        altitude = Math.min(90, Math.max(0, altitude)); // Clamp the altitude value

    } catch (error) {
        console.error('Error updating moon altitude:', error);

        if (prevAltitude !== null) {
            // Assume the moon's altitude change is similar to the last frame.
            altitude = prevAltitude + (altitude - prevAltitude);
        } else {
            moonAltitudeElement.textContent = "Click to reset.";
            moonAltitudeElement.addEventListener('click', toggleShowTicks);
            return;
        }
    }

    const altitudeSegment = altitudeHelper.segment(altitude);
    const altitudeDegree = altitudeHelper.degree(altitude);
    const altitudeTick = showTicks ? `'${String(altitudeHelper.tick(altitude)).padStart(2, '0')}` : '';
    const altitudeUnit = (prevAltitude !== null && altitude < prevAltitude) ? HIGH_MOON : AFTER_TWILIGHT;

    const moonAltitudeString = `${String(altitudeSegment).padStart(2, '0')}:${String(altitudeDegree).padStart(2, '0')}${altitudeTick}° ${altitudeUnit}`;
    moonAltitudeElement.textContent = moonAltitudeString;

    prevAltitude = altitude;  // Store the current altitude for the next frame

    if (moonClockEnabled) {
        requestAnimationFrame(updateMoonAltitude);
    }
}

function toggleShowTicks() {
    showTicks = !showTicks;
    updateMoonAltitude();  // Immediately update the display after toggling
}

moonAltitudeElement.addEventListener('click', toggleShowTicks);

moonAltitudeElement.textContent = ''
// Enable the moon clock on page load
window.addEventListener('load', () => {
    moonClockEnabled = true;
    requestAnimationFrame(updateMoonAltitude);
});
