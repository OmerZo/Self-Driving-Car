const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

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

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function setNumOfCars() {
    let userNumOfCars = parseInt(prompt("How many cars do you want to generate?", numOfCars));
    if(!isNaN(userNumOfCars)) {
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

    // let minCar = cars[0];
    // for (let i = 0; i < cars.length; i++) {
    //     let loss = cars[i].y - 1000 * cars[i].sensor.readings.map(reading => !reading ? 0:reading.offset).reduce((partialSum, a) => partialSum + a, 0);
    //     if(loss < minCar.y) {
    //         minCar = cars[i];
    //     }
    // }

    // bestCar = minCar;

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
    requestAnimationFrame(animate);
}