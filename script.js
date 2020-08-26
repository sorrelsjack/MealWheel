let draggableCircle = null;
let svg = null;
const svgNS = 'http://www.w3.org/2000/svg';

let places = ['CFA', 'KFC'];
let colors = ['#5390d9', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#ef476f', '#bc00dd', '#6a00f4']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

let cumulativePercent = firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);

    return [x, y];
}

const drawSlice = (percent, place, color) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    const largeArcFlag = percent > .5 ? 1 : 0;

    const pathData = [
        `M ${startX} ${startY}`,
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `L 0 0`,
    ].join(' ');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', color);
    path.setAttribute('id', `${place}-path`);
    drawText(place);
    svg.appendChild(path);
}

const drawText = (value) => {
    const text = document.createElement('div');
    text.setAttribute('class', 'circle-text');
    //text.setAttribute('style', `transform: rotate(-0.25turn)`)
    const textNode = document.createTextNode('Test');
    text.appendChild(textNode);
    document.getElementById('circle-svg-container').insertBefore(text, document.getElementById('circle-svg-container').firstChild);
}

// TODO: Draw a whole circle if there's no slices defined
// Credit: https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
const drawChart = () => {
    resetDragValues();
    svg = document.getElementById('circle-svg');

    numberOfSlices = places.length;
    slicePercentage = 1 / numberOfSlices;

    for (let i = 0; i < numberOfSlices; i++) {
        drawSlice(slicePercentage, places[i], colors[i]);
    }

    draggableCircle = Draggable.create('#circle-svg-container', { type: 'rotation', dragResistance: 0 })[0];

    draggableCircle.addEventListener('press', () => {
        clickDurationIntervalId = window.setInterval(trackClickDuration, 1);
        firstAngle = draggableCircle.rotation;
    });

    draggableCircle.addEventListener('dragend', () => {
        window.clearInterval(clickDurationIntervalId);
        secondAngle = draggableCircle.endRotation;

        measureClickVelocity();

        places.forEach(p => {
            if (Draggable.hitTest(`#${p}-path`, '#indicator') && clickDuration === 0) {
                const results = document.getElementById('results');
                results.innerText = `Looks like you're eating at ${p}!`
                results.style.visibility = 'visible';
            }
        });
    });
}

const initialize = () => {
    gsap.registerPlugin(Draggable);
    drawChart();
}

const resetDragValues = () => clickDuration = firstAngle = secondAngle = 0;

// https://stackoverflow.com/questions/52039421/java-2d-slow-down-rotation-like-a-wheel-of-fortune Hmmm
const measureClickVelocity = () => {
    const distance = secondAngle - firstAngle;
    clickVelocity = Math.abs(distance / clickDuration); // Number of revolutions per second
    //const acceleration = clickVelocity / clickDuration; // TODO: Continuously be calculating distance and duration and adjust accel
    // TODO: Get decel
    // TODO: 'Backwards' spins
    gsap.fromTo(
        '#circle-svg-container',
        {
            rotation: draggableCircle.endRotation
        },
        {
            rotation: draggableCircle.endRotation + (360 * clickVelocity * 3),
            duration: 3,
            onInterrupt: () => resetDragValues()
        });

    resetDragValues();
}

const resetChart = () => {
    clearInterval();
    drawChart();
}

// TODO: Fix issue where input is unclickable
// TODO: Add ability to remove items
// TODO: In local storage, maybe add a param to track how many times a place has come up, and store if its 'active' or not
// TODO: 'Sub' previous items back into teh list?
const addItemToList = (value) => {
    const placeList = document.getElementById('place-list');
    const placeListItem = document.createElement('li');
    placeListItem.appendChild(document.createTextNode(value));
    placeList.appendChild(placeListItem);
}

// TODO: Save places to local storage and load them when the page comes up
// TODO: Add place list and the ability to delete places
// TODO: Validation to see if a place was already added
const handleAddClicked = () => {
    if (places.length === 8) return;
    const place = document.getElementById('place-input').value;
    places.push(place);
    addItemToList(place);
    resetChart();
}

const trackClickDuration = () => clickDuration += 1;