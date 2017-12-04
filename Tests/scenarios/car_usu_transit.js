module.exports.car_usu_transit = car_usu_transit;

let gen = require('../../generator.js');
let sct = require('./scenarioTester.js');

function car_usu_transit(inputVehicles, outputVehicles, viewport_key, storage) {
    let viewport = gen.getViewPortFromKey(viewport_key);
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehicleType = true;
    let vehiclePosition = true;
    if (3/4*viewportNum < inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (inputVehicles[i].vehicleType !== "car") {
            vehicleType = false; break;
        }
        if (!sct.isOnBorder(inputVehicles[i].location, viewport) && !sct.isOnBorder(outputVehicles[i].location, viewport)) {
            vehiclePosition = false; break;
        }
    }
    if (vehicleNumber && vehicleType && vehiclePosition) {
        scenarioPassed = true;
    }
    console.log("Scenario car_usu_transit : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}