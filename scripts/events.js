const handleAddPlaceClicked = () => {
    if (places.filter(p => p.active).length === MAX_SLICES) return resetChart();
    const inputValue = document.getElementById('place-input').value;

    if (!inputValue) return resetChart();

    const place = Place(inputValue, 0, document.getElementById('add-active-place-option').checked, getProfilesToAddTo());
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
    updatePlacesLocalStorage();
    updateActiveProfileLocalStorage();
    loadPlacesForProfile();
    populateProfileElements(inputValue);
    updateProfilesLocalStorage();
    setProfileElementStatuses();
    populateLists();
    resetChart();
}

const handleProfileSelected = (e) => {
    activeProfile = e.target.value;

    updateActiveProfileLocalStorage();
    loadPlacesForProfile();
    setProfileElementStatuses();
    populateLists();
    resetChart();
}

const handleAddPlaceRadioButtonToggled = (e) => {
    const active = document.getElementById('add-active-place-option');
    const available = document.getElementById('add-available-place-option');

    if (e.target === active) available.checked = false;
    else if (e.target === available) active.checked = false;

    setInputStatus();
}

const handleClearAllClicked = () => {
    const r = confirm("Are you sure you want to clear your data? This will delete all profiles, places, and history. You can't get this back.");
    if (r) {
        localStorage.clear();
        places = profiles = placesFromStorage = [];
        clearLists();
        clearDropdown();
        resetCheckBoxes();
        resetChart();
        setProfilePlaceholderVisibility();
    }
}

const handleWheelStop = () => {
    resetDragValues();
    places.filter(p => p.active).forEach(p => {
        if (Draggable.hitTest(`#${formatToId(p.name)}-path`, '#indicator', '50%') && clickDuration === 0) {
            results.innerText = `Looks like you're eating at ${p.name}!`
            results.style.visibility = 'visible';
            const place = places.find(pl => formatToId(p.name) === formatToId(pl.name));
            place.timesChosen += 1;
            document.getElementById('history-list').innerHTML = '';
            places.forEach(pl => {
                if (pl.active) addItemToHistoryList(pl)
            });
            updatePlacesLocalStorage();
        }
    });
    var confettiSettings = { target: 'confetti', respawn: 'false' };
    var confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    window.setInterval(() => confetti.clear(), 2000);
}

const handleCancelIconClicked = (e, place) => {
    e.target.parentNode.remove();
    places = placesFromStorage = places.filter(p => p.name.toLowerCase() !== place.toLowerCase());
    updatePlacesLocalStorage();
    setIndicatorVisibility();
    resetChart();
}