module.exports.all_usu_parking = all_usu_parking;

let gen = require('../../generator.js');

function all_usu_parking(inputVehicles, outputVehicles, viewport_key, storage) {
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
        if (inputVehicles[i].location !== outputVehicles[i].location) {
            vehiclePosition = false; break;
        }
    }
    if (vehicleNumber && vehicleTypeChange && vehiclePosition) {
        scenarioPassed = true;
    }
    console.log("Scenario all_usu_parking : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}