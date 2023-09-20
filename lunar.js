const RAD_TO_DEG = 180 / Math.PI;
const HIGH_MOON = 'HM';
const DEGREE_SEGMENT = 15;
const TICK_MULTIPLIER = 240;
const ALTITUDE_OFFSET = 12;
let applyAltitudeOffset = false;
const LAST_UPDATE_TIME = Symbol('lastUpdateTime');
const SUN_CALC = SunCalc;

const moonData = {
    latitude_degrees: 35.6895,
    longitude_degrees: 139.6917
};

const moonAltitudeElement = document.getElementById('moonAltitude');
const TICK_DURATION = 1000;
let updateInterval;

function getTokyoTime() {
    const now = new Date();
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
    tokyoDate.setMilliseconds(now.getMilliseconds());
    return tokyoDate;
}
function preciseInterval(callback, interval) {
    let expectedTime = Date.now() + interval;

    function step() {
        const currentTime = Date.now();
        if (currentTime >= expectedTime) {
            callback();
            expectedTime = currentTime + interval;
        }
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}
function getMoonPosition(now) {
    const moonPosition = SUN_CALC.getMoonPosition(now, moonData.latitude_degrees, moonData.longitude_degrees);
    let altitude = Math.abs(moonPosition.altitude * RAD_TO_DEG);
    if (applyAltitudeOffset) altitude += ALTITUDE_OFFSET;
    return Math.min(90, Math.max(0, altitude));
}

function formatMoonAltitudeString(altitude) {
    let tick = Math.round((altitude % 1) * TICK_MULTIPLIER); // Adjusted for 240 ticks per degree
    let degree = Math.floor(altitude % DEGREE_SEGMENT);
    let segment = Math.floor(altitude / DEGREE_SEGMENT);

    // Wrap-around logic (similar to a clock)
    if (tick === 240) { tick = 0; degree++; } // If tick reaches 240, reset to 0 and increment degree.

    degree = degree % 15;
    if (degree === 15) { degree = 0; segment++; } // If degree reaches 15, reset to 0 and increment segment.

    segment = segment % 12; // If segment reaches 12, reset to 0.

    const tickString = `'${String(tick).padStart(3, '0')}`; // Pad with 3 zeros
    return `${String(segment).padStart(2, '0')}:${String(degree).padStart(2, '0')}${tickString}° ${HIGH_MOON}`;
}



function displayMoonAltitude() {
    const now = getTokyoTime();
    let altitude = getMoonPosition(now);
    let newAltitudeString = formatMoonAltitudeString(altitude);
    moonAltitudeElement.textContent = newAltitudeString;

    // Store the last update time for potential future precision checks
    moonAltitudeElement[LAST_UPDATE_TIME] = now.getTime();
}

// Display the moon altitude once when the window loads.
window.addEventListener('load', displayMoonAltitude);

function handleWindow2CheckboxChange() {
    const checkbox = document.getElementById('window2-checkbox');
    if (checkbox.checked) {
        console.log("Starting the moon clock...");
        if (!updateInterval) {
            updateInterval = preciseInterval(displayMoonAltitude, TICK_DURATION);
        }
    } else {
        console.log("Pausing the moon clock...");
        cancelAnimationFrame(updateInterval);
        updateInterval = null;
    }
}


// Add an event listener to the checkbox.
document.getElementById('window2-checkbox').addEventListener('change', handleWindow2CheckboxChange);

// Initialize the interval when the page loads, only if the checkbox is checked.
if (document.getElementById('window2-checkbox').checked) {
    updateInterval = setInterval(displayMoonAltitude, TICK_DURATION);
}
