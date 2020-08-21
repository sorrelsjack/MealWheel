let draggableCircle = null;
let svg = null;
const svgNS = 'http://www.w3.org/2000/svg';

let places = ['CFA', 'KFC'];
let colors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

let cumulativePercent = 0;
let firstX = 0;
let firstY = 0;
let secondX = 0;
let secondY = 0;
let firstAngle = 0;
let secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);

    return [x, y];
}

const drawSlice = (percent, color) => {
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
    path.setAttribute('id', `${places[0]}-path`)
    // TODO: Fix so text actually shows up
    const text = document.createElementNS(svgNS, 'text');
    text.setAttributeNS(svgNS, 'x', '0');
    text.setAttributeNS(svgNS, 'y', '0');
    text.setAttributeNS(svgNS, 'fill', '#000000');
    text.setAttributeNS(svgNS, 'stroke', '#000000');
    text.setAttributeNS(svgNS, 'font-size', '20');
    text.setAttributeNS(svgNS, 'style', 'z-index: 2; background-color: #FF00000;');
    text.setAttributeNS(svgNS, 'text-anchor', 'middle')
    const textNode = document.createTextNode('Test :)');
    text.appendChild(textNode);
    svg.appendChild(path);
    svg.appendChild(text);
}

const drawText = (deg, text) => {

}

// TODO: Draw a whole circle if there's no slices defined
// Credit: https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
const drawChart = () => {
    svg = document.getElementById('circle-svg');

    numberOfSlices = places.length;
    slicePercentage = 1 / numberOfSlices;

    for (let i = 0; i < numberOfSlices; i++) {
        drawSlice(slicePercentage, colors[i]);
    }

    draggableCircle = Draggable.create('#circle-svg-container', { type: 'rotation', dragResistance: 0 })[0];
    // Angular velocity = change in angular displacement
    draggableCircle.addEventListener('press', () => {
        clickDurationIntervalId = window.setInterval(trackClickDuration, 1);
        //firstX = e.offsetX;
        //firstY = e.offsetY;
        firstAngle = draggableCircle.rotation;
    });
    draggableCircle.addEventListener('dragend', () => {
        //if (!firstX && !firstY) return;
        window.clearInterval(clickDurationIntervalId);
        //secondX = e.offsetX;
        //secondY = e.offsetY;
        secondAngle = draggableCircle.endRotation;

        measureClickVelocity();
    });

    //window.setInterval(rotateChart, 100)
}

const initialize = () => {
    drawChart();
}

const getColors = () => {
    // TODO: Stop colors from touching
    const numberOfColorSetsNeeded = Math.ceil(places.length / colors.length);
    let sets = [];

    for (let i = 0; i < numberOfColorSetsNeeded; i++) {
        sets = sets.concat(colors);
    }

    return sets;
}

const calculateDistanceBetweenPoints = () => Math.sqrt(Math.pow((secondX - firstX), 2) + Math.pow((secondY - firstY), 2));

const measureClickVelocity = () => {
    // TODO: Sometimes the number is Infinity?
    //const distance = calculateDistanceBetweenPoints();
    const distance = secondAngle - firstAngle;
    clickVelocity = distance / clickDuration;
    gsap.to('#circle-svg-container', { rotation: draggableCircle.rotation + 360, duration: 1 }) // TODO: Fix a problem here where the wheel flickers
    clickDuration = secondX = firstX = secondY = firstY = firstAngle = secondAngle = 0;
}

const resetChart = () => {
    clearInterval();
    drawChart();
}

// TODO: Fix issue where input is unclickable
// TODO: Add ability to remove items
// TODO: In local storage, maybe add a param to track how many times a place has come up, and store if its 'active' or not
const addItemToList = (value) => {
    const placeList = document.getElementById('place-list');
    const placeListItem = document.createElement('li');
    placeListItem.appendChild(document.createTextNode(value));
    placeList.appendChild(placeListItem);
}

// TODO: Save places to local storage and load them when the page comes up
// TODO: Add place list and the ability to delete places
// TODO: Add limit to number of items... 8?
const handleAddClicked = () => {
    const place = document.getElementById('place-input').value;
    places.push(place);
    addItemToList(place);
    resetChart();
}

const trackClickDuration = () => clickDuration += 1;

const handleMouseDown = (e) => {
    // TODO: Limit tracked clicks to those inside 600x600 circle
    /*clickDurationIntervalId = window.setInterval(trackClickDuration, 1);
    firstX = e.offsetX;
    firstY = e.offsetY;*/
}

// Angular velocity
const handleMouseUp = (e) => {/*
    if (!firstX && !firstY) return;
    window.clearInterval(clickDurationIntervalId);
    secondX = e.offsetX;
    secondY = e.offsetY;

    measureClickVelocity();*/
}