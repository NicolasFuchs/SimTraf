module.exports = scenarioTester;

let gen = require('./generator.js');

// inputPoints and outputPoints have to be sorted in the same order to enable the comparison
// scenario : string describing which scenario is tested
// inputVehicles : array of json vehicles representing each vehicle generated for the tested scenario before the simulation
// outputVehicles : array of json vehicles representing each vehicle obtained for the tested scenario after the simulation
// viewport : array of two points (hashvalue) describing the view of the map in which the simulation has been run
function scenarioTester(scenario, inputVehicles, outputVehicles, viewport_key, storage) {
    let viewport = gen.getViewPortFromKey(viewport_key);
    let viewportNum = storage.getItemSync(viewport_key);
    let scenarioPassed = false;
    let vehicleNumber = true;
    let vehicleType = true;
    let vehicleTypeChange = false;
    let vehiclePosition = true;
    switch(scenario) {
        // Only cars in usual traffic transit scenario
        case "car_usu_transit" :
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
            break;

        // All vehicles in usual traffic transit scenario
        case "all_usu_transit" :
            vehicleTypeChange = false;
            if (3/4*viewportNum < inputVehicles.length()) {
                vehicleNumber = false;
            }
            for (let i = 0; i < inputVehicles.length(); i++) {
                if (i > 0 && inputVehicles[i].vehicleType !== inputVehicles[i-1].vehicleType) {
                    vehicleTypeChange = true;
                }
                /*if (!isOnBorder(inputVehicles[i].location, viewport) && !isOnBorder(outputVehicles[i].location, viewport)) {
                    vehiclePosition = false; break;
                }*/
            }
            if (vehicleNumber && vehicleTypeChange /*&& vehiclePosition"*/) {
                scenarioPassed = true;
            }
            break;

        // All vehicles in congested traffic transit scenario
        case "all_con_transit" :
            vehicleTypeChange = false;
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
            break;

        // All vehicles in usual traffic parking scenario
        case "all_usu_parking" :
            vehicleTypeChange = false;
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
            if (vehicleNumber && vehicleType && vehiclePosition) {
                scenarioPassed = true;
            }
            break;


        // Only cars in minimal traffic timing scenario
        case "car_min_timing"  :
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
                if (!isOnBorder(inputVehicles[i].location, viewport) && !isOnBorder(outputVehicles[i].location, viewport)) {
                    vehiclePosition = false; break;
                }
            }
            if (vehicleNumber && sameDestination && vehicleType && vehiclePosition) {
                scenarioPassed = true;
            }
            break;
    }
    switch(scenario) {
        case car_usu_transit : console.log("Scenario car_usu_transit : " + (scenarioPassed)?"Test passed sucessfully":"Test failed"); break;
        case all_usu_transit : console.log("Scenario all_usu_transit : " + (scenarioPassed)?"Test passed sucessfully":"Test failed"); break;
        case all_con_transit : console.log("Scenario all_con_transit : " + (scenarioPassed)?"Test passed sucessfully":"Test failed"); break;
        case all_usu_parking : console.log("Scenario all_usu_parking : " + (scenarioPassed)?"Test passed sucessfully":"Test failed"); break;
        case car_min_timing  : console.log("Scenario car_min_timing : " + (scenarioPassed)?"Test passed sucessfully":"Test failed"); break;
    }
}

// Returns if point is on viewport (border)
function isOnBorder(point, viewport) {
    let isOnBorder = false;
    if ((point[0] === viewport[0] || point[0] === viewport[2]) && point[1] >= viewport[3] && point[1] <= viewport[1]) {         // On side 0 (top) or side 2 (bottom)
        isOnBorder = true;
    } else if ((point[1] === viewport[1] || point[1] === viewport[3]) && point[0] >= viewport[2] && point[0] <= viewport[0]) {  // On side 1 (right) or side 3 (left)
        isOnBorder = true;
    }
    return isOnBorder;
}