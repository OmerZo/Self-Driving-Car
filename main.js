const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const distanceInfo = document.getElementById("distanceInfo").querySelector("h3");
const scoreInfo = document.getElementById("scoreInfo").querySelector("h3");
const numOfCarsInfo = document.getElementById("numOfCarsInfo").querySelector("h3");
const timeInfo = document.getElementById("timeInfo").querySelector("h3");
const fileInput = document.getElementById("file-input");
scoreInfo.innerText = "dfg";
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const laneCount = 3;
const road=new Road(carCanvas.width/2,carCanvas.width*0.9, laneCount);

let numOfCars = 100;
if(localStorage.getItem("numOfCars")){
    numOfCars = JSON.parse(localStorage.getItem("numOfCars"));
}
const cars=generateCars(numOfCars);

let bestCar=cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse(
            localStorage.getItem("bestBrain"));
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,0.1);
        }
    }
}

/*
TODO:
Remove dead cars
Auto generate new Cars
Auto generate new Cars with best brain
Save local storage names as const
*/

const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2,getRandomColor()),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2,getRandomColor()),
];

animate();
const startTime = new Date().getTime();
setInterval(updateStopwatch, 1000);

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function saveBrainToFile() {
    const bestBrainBlob = new Blob([JSON.stringify(bestCar.brain)], { type: 'text/plain' });
    const download = window.URL.createObjectURL(bestBrainBlob);
    const a = document.getElementById("saveBrainToFile");
    a.download = "Best_Car_Brain.txt";
    a.href = download;
    a.click();
}

function uploadBrainFromFile() {
    const file = fileInput.files[0];
    if(!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      bestCar.brain = JSON.parse(contents);
    };
    reader.readAsText(file);
}

function setNumOfCars() {
    let userNumOfCars = parseInt(prompt("How many cars do you want to generate?", numOfCars));
    if(!isNaN(userNumOfCars) && userNumOfCars > 0) {
        localStorage.setItem("numOfCars", JSON.stringify(userNumOfCars));
        reload();
    }
}

function reload() {
    location.reload();
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}

//TODO: enum of car types with diffrent pics
function generateTraffic() {
    const numOfCars = Math.floor(Math.random() * laneCount);
    const lastTrafficPos = traffic.slice(-1)[0].y;
    const distFromLastTraffic = 200 + (Math.random() * 20 - 10);
    const carSize = 60 + Math.round(Math.random() * 20 - 10);
    let lane;
    const chosenLanes = [];

    for (let i = 0; i < numOfCars; i++) {
        //TODO: Find a better way to handle this
        do {
            lane = Math.floor(Math.random() * laneCount);
        } while(chosenLanes.includes(lane))
        chosenLanes.push(lane);
        traffic.push(new Car(road.getLaneCenter(lane),lastTrafficPos - distFromLastTraffic, 30, carSize,"DUMMY",2, getRandomColor()));
    }
}

function updateInfo() {
    distanceInfo.innerText = Math.round((bestCar.y * -1) + 100);
    numOfCarsInfo.innerText = cars.filter(car => !car.damaged).length;
}

function updateStopwatch() {
    const currentTime = new Date().getTime(); // get current time in milliseconds
    const elapsedTime = currentTime - startTime; // calculate elapsed time in milliseconds
    const seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    const minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    const hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    const displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    timeInfo.innerHTML = displayTime; // update the display
  }
  
  function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
  }
function loss_function(car){
    let loss_score = 0;

    // highest
    loss_score += car.y;
    
    // sensors touched as little as possible - to maximize.
    const senssors_sum = car.sensor.readings.map(reading => !reading ? 0:reading.offset).reduce((partialSum, a) => partialSum + a, 0);
    loss_score -= 100*senssors_sum;

    // overtook as many other cars as possible
    const overtook_cars_score = parseInt(car.y) - parseInt(traffic[0].y);
    loss_score += 100*overtook_cars_score;

    // highest speed
    loss_score -= 1000*car.speed;
    
    return loss_score;
}
function animate(time){
    if(traffic.slice(-1)[0].y > bestCar.y - 700) {
        generateTraffic();
    }
    if(traffic.length > 20) {
        traffic.shift();
    }
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));
    

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    // Update the best car by loss function
    let minCarIndex = cars.map(car => loss_function(car)).reduce(function(minIndex, currentValue, currentIndex, array) {
        return currentValue < array[minIndex] ? currentIndex : minIndex;
    }, 0);
    bestCar = cars[minCarIndex];

    scoreInfo.innerText = String(-1 * Math.round(loss_function(bestCar)));

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    updateInfo();
    requestAnimationFrame(animate);
}