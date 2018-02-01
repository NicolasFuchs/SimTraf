module.exports.isOnBorder = isOnBorder;

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