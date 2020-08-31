// TODO: Allow them to add to 'Available' list rather than 'Active' list
// TODO: When no more force, use friction constant
// TODO: Add ability to delete places
// TODO: Populate 'available places'
const handleAddPlaceClicked = () => {
    draggableCircle?.kill();

    if (places.length === MAX_SLICES) return resetChart();
    const inputValue = document.getElementById('place-input').value;

    if (!inputValue) return resetChart();

    const place = Place(inputValue, 0, true);
    if (places.map(p => p.name).includes(place.name)) { alert('This place has already been entered.'); return resetChart(); }

    places.push(place);
    populateLists(place);
    updatePlacesLocalStorage();
    resetChart();
}

const handleAddProfileClicked = () => {
    const inputValue = document.getElementById('profile-input').value;

    if (!inputValue) return; 
    if (profiles.includes(inputValue)) alert('This profile has already been entered.');

    profiles.push(inputValue);

    populateProfileDropdown(inputValue);
    updateProfilesLocalStorage();
    setProfileDropdownStatus();
}

const handleClearAllClicked = () => {
    const r = confirm("Are you sure you want to clear your data? This will delete all profiles, places, and history. You can't get this back.");
    if (r) {
        localStorage.clear();
        places = profiles = []
        clearLists();
        clearDropdown();
        resetChart();
    }
}

const handleWheelStop = () => {
    resetDragValues();
    places.forEach(p => {
        if (Draggable.hitTest(`#${p.name.replace(' ', '-')}-path`, '#indicator', 30) && clickDuration === 0) {
            results.innerText = `Looks like you're eating at ${p.name}!` // TODO: Add cool animation
            results.style.visibility = 'visible';
            const place = places.find(pl => p.name === pl.name);
            place.timesChosen += 1;
            document.getElementById('history-list').innerHTML = '';
            places.forEach(pl => addItemToHistoryList(pl));
            updatePlacesLocalStorage();
        }
    });
}