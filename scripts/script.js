const MAX_SLICES = 8;

let places = [];
let profiles = [];

let firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const initialDeceleration = .3;
let currentDeceleration = initialDeceleration;

const initialize = () => {
    gsap.registerPlugin(Draggable);
    loadFromLocalStorage();
    setProfileDropdownStatus();
    populateLists();
    populateProfileDropdown();
    drawChart();
}

// https://stackoverflow.com/questions/52039421/java-2d-slow-down-rotation-like-a-wheel-of-fortune Hmmm
const measureClickVelocity = () => {
    const results = document.getElementById('results');
    const distance = secondAngle - firstAngle;
    clickVelocity = Math.abs(distance / clickDuration); // Number of revolutions per second
    // TODO: Get decel
    // TODO: 'Backwards' spins
    // TODO: Use timeline to model deceleration
    gsap.fromTo(
        '#circle-svg',
        {
            rotation: draggableCircle.endRotation
        },
        {
            rotation: draggableCircle.endRotation + (360 * clickVelocity * 3),
            duration: 3,
            onDragStart: () => { results.style.visibility = 'hidden' },
            onInterrupt: () => handleWheelStop(),
            onComplete: () => handleWheelStop()
        });

    resetDragValues();
}

const loadFromLocalStorage = () => {
    plcs = localStorage.getItem(storageKeys.places);
    prfls = localStorage.getItem(storageKeys.profiles);

    if (plcs) JSON.parse(plcs).forEach(p => places.push(p));
    if (prfls) JSON.parse(prfls).forEach(p => profiles.push(p));
}

const updateLocalStorage = (key, values) => localStorage.setItem(key, JSON.stringify(values));

const updatePlacesLocalStorage = () => updateLocalStorage(storageKeys.places, places);

const updateProfilesLocalStorage = () => updateLocalStorage(storageKeys.profiles, profiles);

const trackClickDuration = () => clickDuration += 1;