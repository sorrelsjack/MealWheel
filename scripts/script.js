const MAX_SLICES = 8;

let placesFromStorage = [];
let places = [];
let profiles = [];

let activeProfile = null;

let firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const initialDeceleration = .3;
let currentDeceleration = initialDeceleration;

let spinMultipliers = [];
let spinAnimation = null;

const initialize = () => {
    gsap.registerPlugin(Draggable);
    loadFromLocalStorage();
    loadPlacesForProfile();
    populateProfileElements();
    setProfileElementStatuses();
    setRadioButtonStatuses();
    populateLists();
    initializeSwappableLists();
    drawChart();
}

const getRandomFloat = () => (Math.random() * (.400 - .1) + .1)
// TODO: Remove a profile

// https://stackoverflow.com/questions/52039421/java-2d-slow-down-rotation-like-a-wheel-of-fortune Hmmm
const measureClickVelocity = () => {
    const results = document.getElementById('results');
    const distance = secondAngle - firstAngle;
    clickVelocity = Math.abs(distance / clickDuration); // Number of revolutions per second
    const decelerationIncrement = getRandomFloat();

    let lastMultiplier = 0;

    do {
        if (clickVelocity === Infinity) break;
        lastMultiplier = clickVelocity - currentDeceleration;
        if (lastMultiplier < 0) break;
        spinMultipliers.push(lastMultiplier);
        currentDeceleration += decelerationIncrement;
    } while (lastMultiplier > 0)

    let cumulativeRotation = draggableCircle.rotation;
    let keyframes = [];

    for (let i = 0; i < spinMultipliers.length; i++) {
        const rotation = (distance > 0 ? 360 : -360) * spinMultipliers[i];
        cumulativeRotation += rotation;
        keyframes.push({ rotation: cumulativeRotation, duration: 1 })
    }

    spinAnimation = gsap.to(
        '#circle-svg',
        {
            keyframes,
            onDragStart: () => { results.style.visibility = 'hidden' },
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
    activeProfile = JSON.parse(actvPrfl);
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

const formatToId = (string) => string.replace(' ', '-').replace(/[\W_]+/g, '');

const loadPlacesForProfile = () => places = activeProfile ? placesFromStorage.filter(p => p?.cities?.includes(activeProfile) || !p?.cities?.length) : [];

const updateLocalStorage = (key, values) => {
    valuesToStringify = values;
    if (key === storageKeys.places) {
        placesFromStorage = deepmerge(placesFromStorage, values);
        placesFromStorage = valuesToStringify = _.uniqBy(placesFromStorage, 'name');
    }
    localStorage.setItem(key, JSON.stringify(valuesToStringify));
}

const updatePlacesLocalStorage = () => updateLocalStorage(storageKeys.places, places);

const updateProfilesLocalStorage = () => updateLocalStorage(storageKeys.profiles, profiles);

const updateActiveProfileLocalStorage = () => updateLocalStorage(storageKeys.activeProfile, activeProfile);

const trackClickDuration = () => clickDuration += 1;