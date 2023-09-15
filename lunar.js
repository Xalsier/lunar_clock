const RAD_TO_DEG = 180 / Math.PI;
const AFTER_TWILIGHT = 'AT';
const HIGH_MOON = 'HM';
const DEGREE_SEGMENT = 15;
const TICK_MULTIPLIER = 100;
const ALTITUDE_OFFSET = 12;
let applyAltitudeOffset = false;
let highestAltitude = null;
const SUN_CALC = SunCalc;
let prevAltitude = null;
let showTicks = true;
let moonClockEnabled = false;
let cumulativeAltitude = 0;
const moonData = {
    latitude_degrees: 35.6895,
    longitude_degrees: 139.6917
};
const moonAltitudeElement = document.getElementById('moonAltitude');
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
function getMoonPosition(now) {
    const moonPosition = SUN_CALC.getMoonPosition(now, moonData.latitude_degrees, moonData.longitude_degrees);
    let altitude = Math.abs(moonPosition.altitude * RAD_TO_DEG);
    if (applyAltitudeOffset) altitude += ALTITUDE_OFFSET;
    return Math.min(90, Math.max(0, altitude));
}
function handleAltitudeError() {
    if (prevAltitude === null) {
        moonAltitudeElement.textContent = "Click to reset.";
        moonAltitudeElement.addEventListener('click', toggleShowTicks);
        throw new Error('Altitude calculation error.');
    }
    return prevAltitude + (cumulativeAltitude - prevAltitude);
}
function calculateCumulativeAltitude(altitude) {
    let altitudeChange = 0;
    if (prevAltitude !== null) {
        altitudeChange = altitude - prevAltitude;
        if (altitudeChange < 0) cumulativeAltitude -= altitudeChange;
    }
    return altitude + cumulativeAltitude;
}
function formatMoonAltitudeString(altitude) {
    const segment = Math.floor(altitude / DEGREE_SEGMENT);
    const degree = Math.floor(altitude % DEGREE_SEGMENT);
    const tick = showTicks ? `'${String(Math.round((altitude % 1) * TICK_MULTIPLIER)).padStart(2, '0')}` : '';
    const unit = (highestAltitude !== null && altitude < highestAltitude) ? HIGH_MOON : AFTER_TWILIGHT;
    return `${String(segment).padStart(2, '0')}:${String(degree).padStart(2, '0')}${tick}° ${unit}`;
}
function updateMoonAltitude() {
    const now = getTokyoTime();
    let altitude;
    try {
        altitude = getMoonPosition(now);
    } catch (error) {
        console.error('Error updating moon altitude:', error);
        altitude = handleAltitudeError();
    }
    altitude = calculateCumulativeAltitude(altitude);
    moonAltitudeElement.textContent = formatMoonAltitudeString(altitude);
    prevAltitude = altitude - cumulativeAltitude;
    if (moonClockEnabled) requestAnimationFrame(updateMoonAltitude);
}
function toggleShowTicks() {
    showTicks = !showTicks;
    updateMoonAltitude();
}
moonAltitudeElement.addEventListener('click', toggleShowTicks);
window.addEventListener('load', () => {
    moonClockEnabled = true;
    requestAnimationFrame(updateMoonAltitude);
});
