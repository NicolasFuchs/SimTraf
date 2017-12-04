module.exports.car_min_timing = car_min_timing;

let gen = require('../../generator.js');
let sct = require('./scenarioTester.js');

function car_min_timing(inputVehicles, outputVehicles, viewport_key, storage) {
    let viewport = gen.getViewPortFromKey(viewport_key);
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehicleType = true;
    let vehiclePosition = true;
    let sameDestination = true;
    if (1/1000*viewportNum < inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (i > 0 && outputVehicles[i].location !== outputVehicles[i-1].location) {
            sameDestination = false; break;
        }
        if (inputVehicles[i].vehicleType !== "car") {
            vehicleType = false; break;
        }
        if (!sct.isOnBorder(inputVehicles[i].location, viewport) && !sct.isOnBorder(outputVehicles[i].location, viewport)) {
            vehiclePosition = false; break;
        }
    }
    if (vehicleNumber && sameDestination && vehicleType && vehiclePosition) {
        scenarioPassed = true;
    }
    console.log("Scenario car_min_timing : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}