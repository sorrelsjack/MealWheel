// TODO: Allow them to add to 'Available' list rather than 'Active' list
// TODO: Add ability to delete places
// TODO: Populate 'available places'
// TODO: Look at what checkboxes are checked and then add to those lists
const handleAddPlaceClicked = () => {
    draggableCircle?.kill();

    if (places.length === MAX_SLICES) return resetChart();
    const inputValue = document.getElementById('place-input').value;

    if (!inputValue) return resetChart();

    const place = Place(inputValue, 0, true, getProfilesToAddTo());
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

    activeProfile = inputValue;
    updateActiveProfileLocalStorage();
    populateProfileElements(inputValue);
    updateProfilesLocalStorage();
    setProfileElementStatuses();
}

const handleProfileSelected = (e) => {
    activeProfile = e.target.value;

    const checkbox = document.getElementById(`profile-checkbox-${activeProfile.toLowerCase()}`);
    checkbox.checked = true;

    const checkboxes = document.querySelectorAll("[id^='profile-checkbox'");
    checkboxes.forEach(c => {
        if (activeProfile === profileForAll) c.checked = true;
        else if (c.id !== checkbox.id) c.checked = false;
    });

    updateActiveProfileLocalStorage();
    loadPlacesForProfile();
    setProfileElementStatuses();
    populateLists();
    drawChart();
}

const handleProfileCheckboxToggled = (e) => {
    const checkboxes = document.querySelectorAll("[id^='profile-checkbox'");
    checkboxes.forEach(c => {
        if (e.target.id === 'profile-checkbox-all') { c.checked = e.target.checked; return; };
        if (c.id !== e.target.id) c.checked = false;
    });
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