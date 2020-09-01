let draggableCircle = null;
let svg = null;
let activePlaceList = null;
let availablePlaceList = null;
const svgNS = 'http://www.w3.org/2000/svg';

let colors = ['#5390d9', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#ef476f', '#bc00dd', '#6a00f4']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

// TODO: FIx issue where longer text stretched into adjacent slice...
// Credit: https://bufferwall.com/posts/330881001ji1a/
const drawChart = () => {
    resetDragValues();
    setIndicatorVisibility();
    setInputStatus();
    setRadioButtonStatuses();
    setPlaceRadioButtonsStatus();

    svg = document.getElementById('circle-svg');

    const cx = 300;
    const cy = 300;
    const radius = 300;

    const activePlaces = places.filter(p => p.active);

    let percent = 100 / activePlaces.length;
    let total = 0;
    var offset = 0;
    var offset2 = 0;
    var arr = [];
    var x;
    var y;
    var la;
    var radians;


    for (var i = 0; i < activePlaces.length; i++)
        total += percent;

    for (var i = 0; i < activePlaces.length; i++) {
        var item = {};

        item.index = i;
        item.text = activePlaces[i].name;
        radians = (((percent / total) * 360) * Math.PI) / 180;
        offset2 = ((offset / total) * 360);

        x = cx + Math.sin(radians) * radius;
        y = cy - Math.cos(radians) * radius;
        la = radians > Math.PI ? 1 : 0;

        // Arc
        item.d = `M${cx} ${cy},L${cx} ${cy - radius},A${radius} ${radius},0 ${la} 1,${x} ${y}Z`;
        item.groupTransform = `rotate(${offset2}, ${cx}, ${cy})`;

        // Text
        x = cx + Math.sin(radians / 2) * radius / 2;
        y = cy - Math.cos(radians / 2) * radius / 2;

        item.x = x;
        item.y = y;
        item.textTransform = `rotate(${-offset2},${x},${y})`;

        offset += percent;
        arr.push(item);
    }

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('transform', `${item.groupTransform}`);

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('id', `${item.text.replace(' ', '-')}-path`);
        path.setAttribute('d', `${item.d}`);
        path.setAttribute('fill', `${colors[i]}`);

        group.appendChild(path);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', 30);
        text.setAttribute('x', item.x);
        text.setAttribute('y', item.y);
        text.setAttribute('transform', item.textTransform);

        const textNode = document.createTextNode(item.text);
        text.appendChild(textNode);

        group.appendChild(text);
        svg.appendChild(group);
    }

    draggableCircle = Draggable.create('#circle-svg', { type: 'rotation', dragResistance: 0 })[0];

    draggableCircle.addEventListener('press', () => {
        clickDurationIntervalId = window.setInterval(trackClickDuration, 1);
        firstAngle = draggableCircle.rotation;

        if (gsap.isTweening('#circle-svg')) {
            spinAnimation?.kill();
            resetDragValues();
            window.clearInterval(clickDurationIntervalId);
        }
    });

    draggableCircle.addEventListener('dragend', () => {
        if (gsap.isTweening('#circle-svg')) return;

        window.clearInterval(clickDurationIntervalId);
        secondAngle = draggableCircle.endRotation;
        measureClickVelocity();
    });
}

const setIndicatorVisibility = () => {
    const indicator = document.getElementById('indicator');
    if (places.filter(p => p.active).length < 2) indicator.style.visibility = 'hidden';
    else indicator.style.visibility = 'visible';
}

const setRadioButtonStatuses = () => {
    const active = document.getElementById('add-active-place-option');
    const available = document.getElementById('add-available-place-option');

    if (places === MAX_SLICES) {
        active.checked = false;
        active.disabled = true;
        available.checked = true;
    }
    else {
        if (!active.checked) if (!available.checked) active.checked = true;
    }
}

const setInputStatus = () => {
    const input = document.getElementById('place-input');
    const button = document.getElementById('add-place-button');

    const active = document.getElementById('add-active-place-option');
    const available = document.getElementById('add-available-place-option');

    const ableToInput = (active.checked || available.checked) && places.length < MAX_SLICES;

    if (!ableToInput) {
        input.value = '';
        input.disabled = button.disabled = true;
    }
    else input.disabled = button.disabled = false;
}

const setProfileElementStatuses = () => {
    setProfileDropdownStatus();
    setProfileCheckboxesStatus();
}

const setProfileDropdownStatus = () => {
    const dropdown = document.getElementById('profile-dropdown');

    if (!profiles.length) dropdown.disabled = true;
    else dropdown.disabled = false;
}

const setProfileCheckboxesStatus = () => {
    const checkbox = document.getElementById('profile-checkbox-all');

    if (!profiles.length) checkbox.disabled = checkbox.checked = true;
    else if (profiles.length && activeProfile !== profileForAll) checkbox.checked = false;
    else checkbox.disabled = false;
}

const setPlaceRadioButtonsStatus = () => {
    const active = document.getElementById('add-active-place-option');

    if (places === MAX_SLICES) {
        active.disabled = true;
        active.checked = false;
    }
    else if (places < MAX_SLICES) active.disabled = false;
}

const populateLists = (place = null) => {
    if (place) {
        if (place?.active) {
            addItemToPlaceList(place);
            addItemToHistoryList(place);
        }
        else addItemToAvailableList(place);
    }
    else {
        clearLists();
        places.forEach(p => {
            if (p?.active) {
                addItemToPlaceList(p);
                addItemToHistoryList(p);
            }
            else addItemToAvailableList(p);
        });
    }
}

const populateProfileElements = (profile = null) => {
    populateProfileDropdown(profile);
    populateProfileCheckboxes(profile);
}

const populateProfileDropdown = (profile = null) => {
    const dropdown = document.getElementById('profile-dropdown');

    const createOption = (value) => {
        const option = document.createElement('option');
        option.value = value;

        option.id = `profile-dropdown-option-${value.toLowerCase()}`;

        option.appendChild(document.createTextNode(value));
        dropdown.appendChild(option);
    }

    if (profile) createOption(profile);
    else profiles.forEach(createOption);

    if (activeProfile) document.getElementById(`profile-dropdown-option-${activeProfile.toLowerCase()}`).selected = "selected";
}

// TODO: Deal with 'all' checkbox if a new thing is added. Should be checked or unchecked
const populateProfileCheckboxes = (profile = null) => {
    const checkboxContainer = document.getElementById('add-to-profile-checkboxes');

    const createCheckbox = (value) => {
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.id = `profile-checkbox-${value.toLowerCase()}`;
        checkbox.name = value;

        checkbox.checked = activeProfile === value ? true : false;
        checkbox.checked = activeProfile === profileForAll ? true : checkbox.checked;

        checkbox.addEventListener('change', (event) => {
            handleProfileCheckboxToggled(event);
        });

        const label = document.createElement('label');

        label.for = checkbox.id;
        label.id = `${checkbox.id}-label`;
        label.appendChild(document.createTextNode(value));

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
    }

    if (profile) createCheckbox(profile);
    else profiles.forEach(createCheckbox);
}

const createCancelIcon = (item) => {
    const cancelIcon = document.createElement('i');
    cancelIcon.className = 'list-icon fa fa-times';
    cancelIcon.addEventListener('click', (event) => handleCancelIconClicked(event, item.name));
    return cancelIcon;
}

const initializeSwappableLists = () => {
    const placeList = document.getElementById('place-list');
    const availableList = document.getElementById('available-place-list');

    const sortable = (list) =>
        new Sortable(list, {
            group: 'placeLists',
            animation: 150,
            onAdd: (evt) => {
                const item = evt.item;
                places.find(p => p.name === item.textContent).active = evt.to === placeList ? true : false;
                updatePlacesLocalStorage();
                resetChart();
            }
        })

    activePlaceList = sortable(placeList);
    availablePlaceList = sortable(availableList)
}

const addItemToPlaceList = (item) => {
    const placeList = document.getElementById('place-list');
    const placeListItem = document.createElement('p');
    placeListItem.className = 'list-item';
    placeListItem.appendChild(document.createTextNode(item.name));
    placeListItem.appendChild(createCancelIcon(item));
    placeList.appendChild(placeListItem);
}

const addItemToHistoryList = (item) => {
    const historyList = document.getElementById('history-list');
    const historyListItem = document.createElement('p');
    historyListItem.className = 'list-item';
    historyListItem.appendChild(document.createTextNode(`${item.name} (${item.timesChosen} Times)`));
    historyList.appendChild(historyListItem);
}

const addItemToAvailableList = (item) => {
    const availableList = document.getElementById('available-place-list');
    const availableListItem = document.createElement('p');
    availableListItem.className = 'list-item';
    availableListItem.appendChild(document.createTextNode(item.name));
    availableListItem.appendChild(createCancelIcon(item));
    availableList.appendChild(availableListItem);

    availablePlaceList = new Sortable(availableList, {
        swap: true,
        swapClass: 'highlight',
        group: 'placeLists',
        animation: 150
    })
}