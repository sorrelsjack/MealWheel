let draggableCircle = null;
let svg = null;
const svgNS = 'http://www.w3.org/2000/svg';

const MAX_SLICES = 8;
let places = [];
let profiles = [];
let colors = ['#5390d9', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#ef476f', '#bc00dd', '#6a00f4']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

let firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const initialDeceleration = .3;
let currentDeceleration = initialDeceleration;

// TODO: Favicon
const initialize = () => {
    gsap.registerPlugin(Draggable);
    loadFromLocalStorage();
    populateLists();
    drawChart();
}

// TODO: Fix bug where no circle shows up if there's just one place
// TODO: FIx issue where longer text stretched into adjacent slice...
// TODO: 'Clear all' functionality
// Credit: https://bufferwall.com/posts/330881001ji1a/
const drawChart = () => {
    resetDragValues();
    setIndicatorVisibility();
    setInputStatus();

    svg = document.getElementById('circle-svg');

    const cx = 300;
    const cy = 300;
    const radius = 300;

    let percent = 100 / places.length;
    let total = 0;
    var offset = 0;
    var offset2 = 0;
    var arr = [];
    var x;
    var y;
    var la;
    var radians;

    for (var i = 0; i < places.length; i++)
        total += percent;

    for (var i = 0; i < places.length; i++) {
        var item = {};

        item.index = i;
        item.text = places[i].name;
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
    });

    draggableCircle.addEventListener('dragend', () => {
        window.clearInterval(clickDurationIntervalId);
        secondAngle = draggableCircle.endRotation;
        measureClickVelocity();
    });
}

const setIndicatorVisibility = () => {
    const indicator = document.getElementById('indicator');
    if (places.length < 2) indicator.style.visibility = 'hidden';
    else indicator.style.visibility = 'visible';
}

// TODO: Create checkbox area will all the profiles and let them select which to add it to. Also add a 'select all'
const setInputStatus = () => {
    const input = document.getElementById('place-input');
    const button = document.getElementById('add-place-button');

    if (places.length === MAX_SLICES) {
        input.value = '';
        input.disabled = button.disabled = true;
    }
    else input.disabled = button.disabled = false;
}

const resetDragValues = () => clickDuration = firstAngle = secondAngle = 0;

const onWheelStop = () => {
    resetDragValues();
    places.forEach(p => {
        if (Draggable.hitTest(`#${p.name.replace(' ', '-')}-path`, '#indicator', 30) && clickDuration === 0) {
            results.innerText = `Looks like you're eating at ${p.name}!` // TODO: Add cool animation
            results.style.visibility = 'visible';
            const place = places.find(pl => p.name === pl.name);
            place.timesChosen += 1;
            document.getElementById('history-list').innerHTML = '';
            places.forEach(pl => addItemToHistoryList(pl));
            updateLocalStorage();
        }
    });
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
            onInterrupt: () => onWheelStop(),
            onComplete: () => onWheelStop()
        });

    resetDragValues();
}

const resetChart = () => {
    clearInterval();
    document.getElementById('circle-svg').innerHTML = '';
    drawChart();
}

// TODO: Factor in active vs inactive
const populateLists = (place = null) => {
    if (place) {
        addItemToPlaceList(place);
        addItemToHistoryList(place);
    }
    else {
        places.forEach(p => {
            addItemToPlaceList(p)
            addItemToHistoryList(p)
        });
    }
}

// TODO: Location-based lists / profiles
// TODO: Add ability to remove items
// TODO: In local storage, maybe add a param to track how many times a place has come up, and store if its 'active' or not
// TODO: 'Sub' previous items back into the list?
const addItemToPlaceList = (item) => {
    const placeList = document.getElementById('place-list');
    const placeListItem = document.createElement('li');
    placeListItem.appendChild(document.createTextNode(item.name));
    placeList.appendChild(placeListItem);
}

const addItemToHistoryList = (item) => {
    const historyList = document.getElementById('history-list');
    const historyListItem = document.createElement('li');
    historyListItem.appendChild(document.createTextNode(`${item.name} (${item.timesChosen} Times)`));
    historyList.appendChild(historyListItem);
}

const loadFromLocalStorage = () => {
    array = localStorage.getItem(storageKeys.places);
    if (!array) return;

    JSON.parse(array).forEach(p => places.push(p));
}

const updateLocalStorage = () => localStorage.setItem(storageKeys.places, JSON.stringify(places));

// TODO: When no more force, use friction constant
// TODO: Add ability to delete places
// TODO: Populate 'available places'
const handleAddClicked = () => {
    draggableCircle?.kill();

    if (places.length === MAX_SLICES) return resetChart();
    const inputValue = document.getElementById('place-input').value;

    if (!inputValue) return resetChart();

    const place = Place(inputValue, 0, true);
    if (places.map(p => p.name).includes(place.name)) { alert('This place has already been entered.'); return resetChart(); }

    places.push(place);
    populateLists(place);
    updateLocalStorage();
    resetChart();
}

const trackClickDuration = () => clickDuration += 1;