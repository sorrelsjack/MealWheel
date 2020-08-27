let draggableCircle = null;
let svg = null;
const svgNS = 'http://www.w3.org/2000/svg';

let places = ['CFA', 'KFC'];
let colors = ['#5390d9', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#ef476f', '#bc00dd', '#6a00f4']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

let firstAngle = secondAngle = 0;

let clickDuration = 0;
let clickDurationIntervalId = null;

// TODO: Hide indicator if there's no slices defined
// Credit: https://bufferwall.com/posts/330881001ji1a/
const drawChart = () => {
    resetDragValues();
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

        var item = places[i];
        var tmp = {};

        tmp.index = i;
        tmp.value = item;
        radians = (((percent / total) * 360) * Math.PI) / 180;
        offset2 = ((offset / total) * 360);
        tmp.data = item;

        x = cx + Math.sin(radians) * radius;
        y = cy - Math.cos(radians) * radius;
        la = radians > Math.PI ? 1 : 0;

        // Arc
        tmp.d = `M${cx} ${cy},L${cx} ${cy - radius},A${radius} ${radius},0 ${la} 1,${x} ${y}Z`;
        tmp.transform = `rotate(${offset2}, ${cx}, ${cy})`;

        // Text
        x = cx + Math.sin(radians / 2) * radius / 2;
        y = cy - Math.cos(radians / 2) * radius / 2;

        tmp.xValue = x;
        tmp.yValue = y;
        tmp.transformValue = `rotate(${-offset2},${x},${y})`;

        offset += percent;
        arr.push(tmp);
    }

    for (let i = 0; i < arr.length; i++){
        let item = arr[i];
        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('transform', `${item.transform}`);

        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('id', `${item.value}-path`);
        path.setAttribute('d', `${item.d}`);
        path.setAttribute('fill', `${colors[i]}`);

        group.appendChild(path);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('fill', 'white'); 
        text.setAttribute('font-size', 30);
        text.setAttribute('x', item.xValue);
        text.setAttribute('y', item.yValue);
        text.setAttribute('transform', item.transformValue);

        const textNode = document.createTextNode(item.value);
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
        '#circle-svg',
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
    document.getElementById('circle-svg').innerHTML = '';
    drawChart();
}

// TODO: Add ability to remove items
// TODO: In local storage, maybe add a param to track how many times a place has come up, and store if its 'active' or not
// TODO: 'Sub' previous items back into the list?
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
    draggableCircle.kill();
    if (places.length === 8) return;
    const place = document.getElementById('place-input').value;
    places.push(place);
    addItemToList(place);
    resetChart();
}

const trackClickDuration = () => clickDuration += 1;