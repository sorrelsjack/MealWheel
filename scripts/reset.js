const resetDragValues = () => clickDuration = firstAngle = secondAngle = 0;

const resetChart = () => {
    clearInterval();
    document.getElementById('circle-svg').innerHTML = '';
    drawChart();
}

const clearLists = () => {
    const placeList = document.getElementById('place-list');
    const historyList = document.getElementById('history-list');
    placeList.innerHTML = '';
    historyList.innerHTML = '';
}

const clearDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.innerHTML = '';
    populateProfileDropdown('All');
}