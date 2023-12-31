var DateTime = luxon.DateTime;
// instantiating socket object
var socket= io.connect('http://127.0.0.1:5000/');
var people = 0;
let updateCount = 0;

$(document).ready(function() {
    socket.on('after connect', function(msg) {
        console.log('After connect', msg.data);
    })
    function runInference() {
        // update the histogram data every 60000 ms = 1 minute
        console.log("The updateCount is: ", updateCount);
        if (updateCount == 2) { // inference has been run on two blocks of 30 seconds so we nee to get data for a minute
            console.log("In getPeopleCountThe updateCount is: ", updateCount);
            updateCount = 0;
            console.log("It's been 60 seconds, getPeopleCount!")
            socket.emit('Update histogram', {
                update: true
            });
        } else {
            updateCount++;
            console.log("In the run inference emit: ", updateCount);
            console.log("It's been 30 seconds, run inference!")
            socket.emit('Run inference', {
                predict: true
            });
        }
    }
    setInterval(runInference, 30000);
    socket.on('update count of people', function(data) {
        console.log('Updated the histogram!');
        console.log(data);
        people = data.num_people;
        $('.sub-heading').text(`In the past minute, there are ${people} people on the Quad.`)
        // if timestamp is less than the last label, we are good to update normally,
        // else if equal to or greater than, we clear current labels and current data and then update.
        updateHistogramChart(people);
    })
})


async function updateHistogramChart(num_people) {
    // const num_people = await getPrediction();
    // const now = new Date();
    // const minute = now.getMinutes();
    // histogramChart.data.labels.shift();
    // histogramChart.data.labels.push(minute);
    // histogramChart.data.datasets[0].data.shift();
    console.log(histogramChart.data.datasets[0].data.length)
    histogramChart.data.datasets[0].data.push(num_people);
    histogramChart.update();
}

function generateLabels() {
    const labels = [];
    const currentTime = new Date();

    // histograms last x-label is 1 hour from current time
    // var nextHour = DateTime.now().plus({hours: 1}).toJSDate();
    var next5Mins = DateTime.now().plus({minutes: 5}).toJSDate();

    // Start with the current time
    let currentTimeLabel = currentTime.getTime();
    // Time interval in milliseconds (1 minute)
    const interval = 1000 * 60;

    // Generate labels for each minute until the next hour
    while (currentTimeLabel < next5Mins.getTime()) {
        labels.push(new Date(currentTimeLabel).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        currentTimeLabel += interval;
    }
    return labels;
}

// Create the histogram chart
var ctx = document.getElementById('histogramChart').getContext('2d');
var histogramChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: generateLabels(),
        datasets: [{
            label: 'Number of People',
            data: [0],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of People'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Time of Day (minutes)'
            }
        }
        }
    }
});