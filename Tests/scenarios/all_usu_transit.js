module.exports.all_usu_transit = all_usu_transit;

let gen = require('../../generator.js');
let sct = require('./scenarioTester.js');

function all_usu_transit(inputVehicles, outputVehicles, viewport_key, storage) {
    let viewport = gen.getViewPortFromKey(viewport_key);
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehiclePosition = true;
    let vehicleTypeChange = false;
    if (3/4*viewportNum < inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (i > 0 && inputVehicles[i].vehicleType !== inputVehicles[i-1].vehicleType) {
            vehicleTypeChange = true;
        }
        /*if (!sct.isOnBorder(inputVehicles[i].location, viewport) && !sct.isOnBorder(outputVehicles[i].location, viewport)) {
            vehiclePosition = false; break;
        }*/
    }
    if (vehicleNumber && vehicleTypeChange /*&& vehiclePosition"*/) {
        scenarioPassed = true;
    }
    console.log("Scenario all_usu_transit : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}