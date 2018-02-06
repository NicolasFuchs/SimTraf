module.exports.generator = generator;
module.exports.getViewPortFromKey = getViewPortFromKey;
module.exports.cacheInCheck = cacheInCheck;
module.exports.cacheNearCheck = cacheNearCheck;
module.exports.pointsInViewport = pointsInViewport;
module.exports.splitPoints = splitPoints;
module.exports.pointsFromRectangles = pointsFromRectangles;
module.exports.mulReqCaller = mulReqCaller;

let storage = require('node-persist');

let drag = require('./drag.js');

let crt_hashkey = '';       // Current hashkey
let crt_viewport = [];      // Current viewport
let last_viewport = [];     // Viewport of the last map

let APIkey = 'AIzaSyCtfkCcjL5cvhCb8cdncY95T4qLicNOYMU';
module.exports.APIkey = APIkey;

const granularity = 1000;

module.exports.granularity = granularity;

function mulReqCaller(points, add_hashvalue, result, callback) {
    if (points.length === 0) {
        if (add_hashvalue !== "") {
            result = result + ',' + splitPoints(add_hashvalue, crt_viewport);
        }
        storage.setItemSync(crt_hashkey, result);
        result = ('{"allSnappedPoints":[').concat(result);
        result = result.concat(']}');
        last_viewport = crt_viewport;
        module.exports.last_viewport = last_viewport;
        callback(result);
    } else {
        let request = require('request');
        let crtpoints = '';
        crtpoints += points.pop() + ',';
        for (let i = 1; points.length > 0 && i < 199; i++) {            // One nearest roads request can't contain more than 100 points (200 lat/lng)
            crtpoints += points.pop();
            if (points.length !== 0) {
                if (i % 2 === 0) crtpoints += ',';
                else if (i < 198) crtpoints += '|';
            }
        }
        if (points.length > 0) {
            crtpoints += points.pop();
        }
        let headers = {'Content-Type': 'application/json'};
        let options = {
            url: 'https://roads.googleapis.com/v1/nearestRoads',
            method: 'GET',
            headers: headers,
            qs: {'points': crtpoints, 'key': APIkey}
        };
        request.get(options, function (error, response, body) {
            if (result === "" && body !== "{}\n") {
                result = result.concat(body);
            } else if (body !== "{}\n") {
                result = (result + ',').concat(body);
            }
            mulReqCaller(points, add_hashvalue, result, callback);
        });
    }
}

// Calculates grids of points from an array of rectangles
function pointsFromRectangles (rectangles) {
    let points = [];
    for (let k = 0; k < rectangles.length; k++) {
        let gran_lat = parseInt(Math.abs(rectangles[k][0]-rectangles[k][2]) * granularity);
        let gran_lng = parseInt(Math.abs(rectangles[k][1]-rectangles[k][3]) * granularity);
        let delta_lat = parseFloat(Math.abs(rectangles[k][0]-rectangles[k][2]) / gran_lat);
        let delta_lng = parseFloat(Math.abs(rectangles[k][1]-rectangles[k][3]) / gran_lng);
        let last_lat = parseFloat(rectangles[k][2]);
        let last_lng = parseFloat(rectangles[k][3]);
        for (let i = 0; i <= gran_lat; i++) {
            for (let j = 0; j <= gran_lng; j++) {
                points.push(last_lng);
                points.push(last_lat);
                last_lng += delta_lng;
            }
            last_lat += delta_lat;
            last_lng = parseFloat(rectangles[k][3]);
        }
    }
    return points;
}

// Removes points in hashvalue that aren't contained in viewport
function splitPoints (hashvalue, viewport) {
    hashvalue = ('{"allSnappedPoints":[').concat(hashvalue);
    hashvalue = hashvalue.concat(']}');
    let points = JSON.parse(hashvalue);
    for (let i = 0; i < points.allSnappedPoints.length; i++) {
        for (let j = 0; j < points.allSnappedPoints[i].snappedPoints.length; j++) {
            let point = points.allSnappedPoints[i].snappedPoints[j];
            let point_lat = point.location.latitude;
            let point_lng = point.location.longitude;
            if (point_lat < viewport[2] || point_lat > viewport[0] || point_lng < viewport[3] || point_lng > viewport[1]) {
                points.allSnappedPoints[i].snappedPoints.splice(j,1);
                j--;
            }
        }
    }
    points = JSON.stringify(points);
    return points.substring(21, points.length-2);
}

// Checks if data can be pulled from cache and returns the most similar hashKey contained in viewport
function cacheInCheck (viewport) {
    let keys = storage.keys();
    let bestFit = [NaN,NaN];                                // First value represents the comparison value and the second value represents the best hashKey
    let result = '';
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'scenarios') continue;
        let viewport_key = getViewPortFromKey(keys[i]);
        let SW_lng = parseFloat(viewport_key.pop());
        let SW_lat = parseFloat(viewport_key.pop());
        let NE_lng = parseFloat(viewport_key.pop());
        let NE_lat = parseFloat(viewport_key.pop());
        if (viewport[0] <= NE_lat && viewport[1] <= NE_lng && viewport[2] >= SW_lat && viewport[3] >= SW_lng) {
            let cmpValue = (NE_lat - viewport[0]) + (NE_lng - viewport[1]) + (viewport[2] - SW_lat) + (viewport[3] - SW_lng);
            if (isNaN(bestFit[0]) || (cmpValue < bestFit[0])) {
                bestFit[0] = cmpValue;
                bestFit[1] = keys[i];
                if (cmpValue === 0) {
                    result = 'YES|' + bestFit[1];
                    return result;
                }
            }
        }
    }
    if (isNaN(bestFit[0])) {
        return 'NOCACHE';
    } else if (result === '') {
        result = 'NO|' + bestFit[1];
        return result;
    }
}

// Checks the hashValue containing the biggest part of the viewport
function cacheNearCheck (viewport) {
    let keys = storage.keys();
    let bestFit = [NaN,NaN,[]];                                // First value represents the comparison value and the second value represents the best hashValue
    for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'scenarios') continue;
        let viewport_key = getViewPortFromKey(keys[i]);
        let NE_lat = parseFloat(viewport_key[0]);
        let NE_lng = parseFloat(viewport_key[1]);
        let SW_lat = parseFloat(viewport_key[2]);
        let SW_lng = parseFloat(viewport_key[3]);

        let hash_points = [[NE_lat,NE_lng],[SW_lat,NE_lng],[SW_lat,SW_lng],[NE_lat,SW_lng]];
        let view_points = [[viewport[0],viewport[1]],[viewport[2],viewport[1]],[viewport[2],viewport[3]],[viewport[0],viewport[3]]];
        let points_in = pointsInViewport(hash_points, viewport);
        let rectangles = [];

        let area = NaN;
        let num_in = 0;
        for (let j = 0; j < 4; j++) {
            if (points_in[j]) num_in++;
        }
        switch(num_in) {
            case 0: if (NE_lat <= viewport[2] || NE_lng <= viewport[3] || SW_lat >= viewport[0] || SW_lng >= viewport[1]) {     // No intersection
                        break;
                    }
                    for (let j = 0; j < 4; j++) {
                        if (j % 2 === 0) {
                            if ((j === 0 && hash_points[j][1] < viewport[j+1]) || (j === 2 && hash_points[j][1] > viewport[j+1])) {
                                area = Math.abs((viewport[j] - viewport[(j + 2) % 4]) * (hash_points[j][1] - viewport[(j + 3) % 4]));
                            }
                        } else {
                            if ((j === 1 && hash_points[j][0] > viewport[(j+1)%4]) || (j === 3 && hash_points[j][0] < viewport[(j+1)%4])) {
                                area = Math.abs((viewport[(j + 3) % 4] - viewport[(j + 2) % 4]) * (hash_points[j][0] - viewport[(j + 3) % 4]));
                            }
                        }
                    }
                    if (viewport_key[0] > crt_viewport[2] && viewport_key[0] < crt_viewport[0]) {
                        rectangles = [[crt_viewport[0], crt_viewport[1], viewport_key[0], crt_viewport[3]]];
                    } else if (viewport_key[1] > crt_viewport[3] && viewport_key[1] < crt_viewport[1]) {
                        rectangles = [[crt_viewport[0], crt_viewport[1], crt_viewport[2], viewport_key[1]]];
                    } else if (viewport_key[2] > crt_viewport[2] && viewport_key[2] < crt_viewport[0]) {
                        rectangles = [[viewport_key[2], crt_viewport[1], crt_viewport[2], crt_viewport[3]]];
                    } else if (viewport_key[3] > crt_viewport[3] && viewport_key[3] < crt_viewport[1]) {
                        rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]]];
                    }
                    break;
            case 1: for (let j = 0; j < 4; j++) {
                        if (points_in[j]) {
                            area = Math.abs((hash_points[j][0]-view_points[(j+2)%4][0]) * (hash_points[j][1]-view_points[(j+2)%4][1]));
                            break;
                        }
                    }
                    if (points_in[0]) {
                        rectangles = [[crt_viewport[0], viewport_key[1], viewport_key[0], crt_viewport[3]], [crt_viewport[0], crt_viewport[1], crt_viewport[2], viewport_key[1]]];
                    } else if (points_in[1]) {
                        rectangles = [[viewport_key[2], viewport_key[1], crt_viewport[2], crt_viewport[3]], [crt_viewport[0], crt_viewport[1], crt_viewport[2], viewport_key[1]]];
                    } else if (points_in[2]) {
                        rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]], [viewport_key[2], crt_viewport[1], crt_viewport[2], viewport_key[3]]];
                    } else if (points_in[3]) {
                        rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]], [crt_viewport[0], crt_viewport[1], viewport_key[0], viewport_key[3]]];
                    }
                    break;
            case 2: for (let j = 0; j < 4; j++) {
                        if (points_in[j] && points_in[(j+1)%4]) {
                            if (j % 2 === 0) {
                                area = Math.abs((hash_points[j][0]-hash_points[(j+1)%4][0]) * (hash_points[j][1]-view_points[(j+2)%4][1]));
                            } else {
                                area = Math.abs((hash_points[j][1]-hash_points[(j+1)%4][1]) * (hash_points[j][0]-view_points[(j+2)%4][0]));
                            }
                            break;
                        }
                    }
                    if (points_in[0] && points_in[1]) {
                        rectangles = [[crt_viewport[0], crt_viewport[1], viewport_key[0], crt_viewport[3]], [viewport_key[0], crt_viewport[1], viewport_key[2], viewport_key[1]], [viewport_key[2], crt_viewport[1], crt_viewport[2], crt_viewport[3]]];
                    } else if (points_in[1] && points_in[2]) {
                        rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]], [viewport_key[2], viewport_key[1], crt_viewport[2], viewport_key[3]], [crt_viewport[0], crt_viewport[1], crt_viewport[2], viewport_key[1]]];
                    } else if (points_in[2] && points_in[3]) {
                        rectangles = [[crt_viewport[0], crt_viewport[1], viewport_key[0], crt_viewport[3]], [viewport_key[0], viewport_key[3], viewport_key[2], crt_viewport[3]], [viewport_key[2], crt_viewport[1], crt_viewport[2], crt_viewport[3]]];
                    } else if (points_in[3] && points_in[0]) {
                        rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]], [crt_viewport[0], viewport_key[1], viewport_key[0], viewport_key[3]], [crt_viewport[0], crt_viewport[1], viewport_key[0], viewport_key[1]]];
                    }
                    break;
            case 4: area = (NE_lat-SW_lat) * (NE_lng-SW_lng);
                    rectangles = [[crt_viewport[0], viewport_key[3], crt_viewport[2], crt_viewport[3]], [viewport_key[2], viewport_key[1], crt_viewport[2], viewport_key[3]], [crt_viewport[0], crt_viewport[1], crt_viewport[2], viewport_key[1]], [crt_viewport[0], viewport_key[1], viewport_key[0], viewport_key[3]]];
        }
        if (isNaN(bestFit[0]) || (area > bestFit[0])) {
            bestFit[0] = area;
            bestFit[1] = keys[i];
            bestFit[2] = rectangles;
        }
    }
    if (isNaN(bestFit[0])) {
        return 'NONEAR';
    } else {
        return [bestFit[1],bestFit[2]];
    }
}

// Returns which points of hashtab are contained in viewport
function pointsInViewport(points, viewport) {
    let res = [false,false,false,false];
    for (let i = 0; i < 4; i++) {
        if (points[i][0] < viewport[0] && points[i][0] > viewport[2] && points[i][1] < viewport[1] && points[i][1] > viewport[3]) {
            res[i] = true;
        }
    }
    return res;
}

// Parses key to get an array of two LatLng
function getViewPortFromKey (hashkey) {
    let pointsArray = [];
    let crtNum = '';
    for (let i = 0; i < hashkey.length; i++) {
        if (hashkey.charAt(i) === ',' || i === hashkey.length-1) {
            if (i === hashkey.length-1) {
                crtNum += hashkey.charAt(i);
            }
            pointsArray.push(crtNum);
            crtNum = '';
            continue;
        }
        crtNum += hashkey.charAt(i);
    }
    return pointsArray;
}

function generator (NE_lat, NE_lng, SW_lat, SW_lng, callback) {
    storage.initSync({
        dir: '../persist',
        stringify: JSON.stringify,
        parse: JSON.parse,
        encoding: 'utf8',
        continuous: true,
        ttl: true
    });

    crt_hashkey = NE_lat + ',' +  NE_lng + ',' + SW_lat + ',' + SW_lng;
    crt_viewport = [NE_lat, NE_lng, SW_lat, SW_lng];
    module.exports.crt_viewport = crt_viewport;
    module.exports.crt_hashkey = crt_hashkey;

    //drag(storage, callback);
    callback();
}