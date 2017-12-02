module.exports.car_min_timing = car_min_timing;

function car_min_timing() {
    if (3/4*viewportNum < inputVehicles.length()) {
        vehicleNumber = false;
    }
    for (let i = 0; i < inputVehicles.length(); i++) {
        if (inputVehicles[i].vehicleType !== "car") {
            vehicleType = false; break;
        }
        if (!isOnBorder(inputVehicles[i].location, viewport) && !isOnBorder(outputVehicles[i].location, viewport)) {
            vehiclePosition = false; break;
        }
    }
    if (vehicleNumber && vehicleType && vehiclePosition) {
        scenarioPassed = true;
    }
}