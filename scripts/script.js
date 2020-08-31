const MAX_SLICES = 8;

let placesFromStorage = [];
let places = [];
let profiles = [];

const profileForAll = 'All';
let activeProfile = profileForAll;

let firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const initialDeceleration = .3;
let currentDeceleration = initialDeceleration;

let spinMultipliers = [];

const initialize = () => {
    gsap.registerPlugin(Draggable);
    loadFromLocalStorage();
    loadPlacesForProfile();
    populateProfileElements();
    setProfileElementStatuses();
    populateLists();
    drawChart();
}

// TODO: If 'all' is checked when the user has no profiles, record 'all' as its profile in localStorage
// TODO: Remove a profile

// https://stackoverflow.com/questions/52039421/java-2d-slow-down-rotation-like-a-wheel-of-fortune Hmmm
const measureClickVelocity = () => {
    const results = document.getElementById('results');
    const distance = secondAngle - firstAngle;
    clickVelocity = Math.abs(distance / clickDuration); // Number of revolutions per second

    let lastMultiplier = 0;

    do {
        lastMultiplier = clickVelocity - currentDeceleration
        if (lastMultiplier < 0) break;
        spinMultipliers.push(lastMultiplier);
        currentDeceleration += .3;
    } while (lastMultiplier > 0)

    // TODO: 'Backwards' spins
    let cumulativeRotation = draggableCircle.rotation;
    let keyframes = [];

    for (let i = 0; i < spinMultipliers.length; i++) {
        const rotation = 360 * spinMultipliers[i];
        cumulativeRotation += rotation;
        keyframes.push({ rotation: cumulativeRotation, duration: 1 })
    }

    gsap.to(
        '#circle-svg',
        {
            keyframes,
            onDragStart: () => { results.style.visibility = 'hidden' },
            onInterrupt: () => handleWheelStop(),
            onComplete: () => handleWheelStop()
        }
    )

    resetDragValues();
}

const loadFromLocalStorage = () => {
    plcs = localStorage.getItem(storageKeys.places);
    prfls = localStorage.getItem(storageKeys.profiles);
    actvPrfl = localStorage.getItem(storageKeys.activeProfile);

    if (plcs) JSON.parse(plcs).forEach(p => placesFromStorage.push(p));
    if (prfls) JSON.parse(prfls).forEach(p => profiles.push(p));
    activeProfile = actvPrfl ? JSON.parse(actvPrfl) : profileForAll;
}

const getProfilesToAddTo = () => {
    const checkboxes = document.querySelectorAll("[id^='profile-checkbox'");
    let toAddTo = [];

    checkboxes.forEach(c => {
        if (c.id === 'profile-checkbox-all') return profiles;
        else {
            if (c.checked) toAddTo.push(c.name);
        }
    });

    return toAddTo;
}

const loadPlacesForProfile = () => places = activeProfile !== profileForAll ? placesFromStorage.filter(p => p.cities.includes(activeProfile)) : placesFromStorage;

const updateLocalStorage = (key, values) => localStorage.setItem(key, JSON.stringify(values));

const updatePlacesLocalStorage = () => updateLocalStorage(storageKeys.places, places);

const updateProfilesLocalStorage = () => updateLocalStorage(storageKeys.profiles, profiles);

const updateActiveProfileLocalStorage = () => updateLocalStorage(storageKeys.activeProfile, activeProfile);

const trackClickDuration = () => clickDuration += 1;