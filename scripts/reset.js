const resetDragValues = () => { 
    clickDuration = clickVelocity = firstAngle = secondAngle = 0; 
    currentDeceleration = initialDeceleration;
    spinMultipliers = [];
}

const resetChart = () => {
    clearInterval();
    document.getElementById('circle-svg').innerHTML = '';
    drawChart();
}

const resetCheckBoxes = () => {
    const checkboxes = document.querySelectorAll("[id^='profile-checkbox'");

    checkboxes.forEach(c => {
        if (!c.id.includes('profile-checkbox-all')) {
            c.remove();
            document.getElementById(`${c.id}-label`)?.remove();
        }
    });
}

const clearLists = () => {
    const placeList = document.getElementById('place-list');
    const historyList = document.getElementById('history-list');
    const availablePlaceList = document.getElementById('available-place-list');
    placeList.innerHTML = historyList.innerHTML = availablePlaceList.innerHTML = '';
}

const clearDropdown = () => {
    const options = document.querySelectorAll("[id^='profile-dropdown-option'");

    options.forEach(c => {
        if (c.id !== 'profile-dropdown-option-all') c.remove();
    });

    setProfileDropdownStatus();
}