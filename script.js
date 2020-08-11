const degrees = 360;
let slices = ['PDQ', 'Chick-Fil-A', 'Smashburger', 'Taco Bell', 'KFC', 'McDonalds'];
let colors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']; // https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

const initialize = () => {
    drawPieChart();
}

const getChartValues = () => {
    let values = [];
    const percent = 1 / slices.length;

    for (let i = 0; i < slices.length; i++) {
        values.push(percent);
    }

    return values;
}

const getColors = () => {
    // TODO: Avoid the same colors touching
    const numberOfColorSetsNeeded = Math.ceil(slices.length / colors.length) || 6;
    let sets = [];

    for (let i = 0; i < numberOfColorSetsNeeded; i++) {
        sets = sets.concat(colors);
    }

    return sets;
}

// TODO: Destroy chart when a new slice is added
const drawPieChart = () => {
    const context = document.getElementById("circle-canvas").getContext("2d");
    const chart = new Chart(context, {
        type: 'pie',
        data: {
            datasets: [{
                data: getChartValues(),
                backgroundColor: getColors(),
            }]
        },
        options: {
            tooltips: {
                enabled: false
            },
            plugins: {
                datalabels: {
                    font: {
                        size: 20
                    },
                    color: 'white',
                    formatter: (value, context) => slices[context.dataIndex]
                }
            }
        }
    })
}

const measureClickVelocity = () => {

}

// TODO: Save places to local storage and load them when the page comes up
const handleAddClicked = () => {
    const place = document.getElementById('place-input').value;
    slices.push(place);
}