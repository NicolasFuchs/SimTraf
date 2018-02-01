module.exports.all_usu_transit = all_usu_transit;

function all_usu_transit(inputVehicles, viewport_key, storage) {
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehicleTypeChange = false;
    if (3/4*viewportNum < inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (i > 0 && inputVehicles[i].vehicleType !== inputVehicles[i-1].vehicleType) {
            vehicleTypeChange = true;
        }
    }
    if (vehicleNumber && vehicleTypeChange) {
        scenarioPassed = true;
    }
    console.log("Scenario all_usu_transit : " + (scenarioPassed)?"Test passed successfully":"Test failed");
}