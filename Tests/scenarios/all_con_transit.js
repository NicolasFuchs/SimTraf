module.exports.all_con_transit = all_con_transit;

let gen = require('../../generator.js');

function all_con_transit(inputVehicles, outputVehicles, viewport_key, storage) {
    let viewport = gen.getViewPortFromKey(viewport_key);
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehicleTypeChange = false;
    let congestion = false;
    if (3/4*viewportNum > inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (i > 0 && inputVehicles[i].vehicleType !== inputVehicles[i-1].vehicleType) {
            vehicleTypeChange = true;
        }
        if (inputVehicles[i].speed > 10) {
            congestion = true;
        }
    }
    if (vehicleNumber && vehicleTypeChange && congestion) {
        scenarioPassed = true;
    }
    console.log("Scenario all_con_transit : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}