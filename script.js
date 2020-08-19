let degrees = 360;
let slices = ['PDQ', 'Chick-Fil-A', 'Smashburger', 'Taco Bell', 'KFC', 'McDonalds'];
let colors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

// Credit: http://jsbin.com/qefada/11/edit?html,js,output
var sliceDeg = 360 / slices.length;
var canvas = null;
var ctx = null;
var width = 0;
var center = 0;

let rotateDegree = 0;

let firstX = 0;
let firstY = 0;
let secondX = 0;
let secondY = 0;
let clickDuration = 0;
let clickDurationIntervalId = null;

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const calculateSliceDeg = () => sliceDeg = 360 / slices.length;

const degToRad = (deg) => deg * Math.PI / 180;

const drawSlice = (deg, color) => {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(center, center);
    ctx.arc(center, center, width / 2, degToRad(deg), degToRad(deg + sliceDeg));
    ctx.lineTo(center, center);
    ctx.fill();
}

const drawText = (deg, text) => {
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(degToRad(deg));
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(text, 170, 10);
    ctx.restore();
}

// TODO: Simulate deceleration
const rotateChart = () => {
    const c = document.getElementById('circle-canvas');
    c.style.transform = `rotate(${rotateDegree += 2}deg)`;
}

const drawChart = () => {
    canvas = document.getElementById('circle-canvas');
    ctx = canvas.getContext('2d');
    width = canvas.width;
    center = width / 2;

    ctx.clearRect(0, 0, width, width);
    for (var i = 0; i < slices.length; i++) {
        drawSlice(degrees, getColors()[i]);
        drawText(degrees + sliceDeg / 2, slices[i]);
        degrees += sliceDeg;
    }

    //window.setInterval(rotateChart, 100)
}

const initialize = () => {
    drawChart();
}

const getColors = () => {
    // TODO: Stop colors from touching
    const numberOfColorSetsNeeded = Math.ceil(slices.length / colors.length);
    let sets = [];

    for (let i = 0; i < numberOfColorSetsNeeded; i++) {
        sets = sets.concat(colors);
    }

    return sets;
}

const calculateDistanceBetweenPoints = () => Math.sqrt(Math.pow((secondX - firstX), 2) + Math.pow((secondY - firstY), 2));

const measureClickVelocity = () => {
    // TODO: Sometimes the number is Infinity?
    const distance = calculateDistanceBetweenPoints();
    clickVelocity = distance / clickDuration;
    clickDuration = secondX = firstX = secondY = firstY = 0;
}

const resetChart = () => {
    calculateSliceDeg();
    clearInterval();
    drawChart();
    rotateDegree = 0;
}

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
// TODO: Add limit to number of items
const handleAddClicked = () => {
    const place = document.getElementById('place-input').value;
    slices.push(place);
    addItemToList(place);
    resetChart();
}

const trackClickDuration = () => clickDuration += 1;

const handleMouseDown = (e) => {
    // TODO: Limit tracked clicks to those inside 600x600 circle
    clickDurationIntervalId = window.setInterval(trackClickDuration, 1);
    firstX = e.offsetX;
    firstY = e.offsetY;
}

const handleMouseUp = (e) => {
    if (!firstX && !firstY) return;
    window.clearInterval(clickDurationIntervalId);
    secondX = e.offsetX;
    secondY = e.offsetY;

    measureClickVelocity();
}