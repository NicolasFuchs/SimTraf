module.exports.isOnBorder = isOnBorder;

// inputPoints and outputPoints have to be sorted in the same order to enable the comparison
// scenario : string describing which scenario is tested
// inputVehicles : array of json vehicles representing each vehicle generated for the tested scenario before the simulation
// outputVehicles : array of json vehicles representing each vehicle obtained for the tested scenario after the simulation
// viewport : array of two points (hashvalue) describing the view of the map in which the simulation has been run
function scenarioTester() {

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