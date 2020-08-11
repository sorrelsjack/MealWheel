let degrees = 360;
let slices = ['PDQ', 'Chick-Fil-A', 'Smashburger', 'Taco Bell', 'KFC', 'McDonalds'];
//let colors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51
let colors = ['#264653', '#e9c46a'];

// Credit: http://jsbin.com/qefada/11/edit?html,js,output
var sliceDeg = 360 / slices.length;
var canvas = null;
var ctx = null;
var width = 0;
var center = 0;

let rotateDegree = 0;

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

const measureClickVelocity = () => {
    // TODO: In the background, go through the indexes at a comparable speed to the pie slices
}

const resetChart = () => {
    calculateSliceDeg();
    clearInterval();
    drawChart();
    rotateDegree = 0;
}

// TODO: Save places to local storage and load them when the page comes up
// TODO: Add place list and the ability to delete places
const handleAddClicked = () => {
    const place = document.getElementById('place-input').value;
    slices.push(place);
    resetChart();
}