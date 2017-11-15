module.exports.generator = generator;
module.exports.getViewPortFromKey = getViewPortFromKey;
module.exports.cacheInCheck = cacheInCheck;
module.exports.cacheNearCheck = cacheNearCheck;
module.exports.splitPoints = splitPoints;
module.exports.mulReqCaller = mulReqCaller;

let storage = require('node-persist');

let loca = require('./loca.js');
let zoom = require('./zoom.js');
let drag = require('./drag.js');

let crt_hashkey = '';       // Current hashkey
let crt_viewport = [];      // Current viewport
let last_hashkey = '';      // hashkey of last map view
let last_viewport = [];     // viewport of last map view

module.exports.last_hashkey = last_hashkey;
module.exports.last_viewport = last_viewport;

const map_diff_lat = 0.02211494699;
const map_diff_lng = 0.03218650819;

function mulReqCaller(points, add_hashvalue, result, callback) {
    let request = require('request');
    let crtpoints = '';
    if (points.length > 0) {
        crtpoints += points.pop() + ',';
    }
    // One nearest roads request can't contain more than 100 points
    for (let i = 1; points.length > 0 && i < 199; i++) {
        crtpoints += points.pop();
        if (i % 2 === 0 && points.length > 0) crtpoints += ',';
        else if (i < 198) crtpoints += '|';
    }
    if (points.length > 0) {
        crtpoints += points.pop();

        let headers = {'Content-Type':'application/json'};
        let options = {
            url: 'https://roads.googleapis.com/v1/nearestRoads',
            method: 'GET',
            headers: headers,
            qs: {'points':crtpoints, 'key':'AIzaSyCtfkCcjL5cvhCb8cdncY95T4qLicNOYMU'}
        };
        request.get(options, function(error, response, body) {
            if (result === '' || body === '') {
                result = result.concat(body);
            } else {
                result = (result + ',').concat(body);
            }
            mulReqCaller(points, add_hashvalue, result, callback);
        });
    } else {
        if (crtpoints !== '') {
            result = (result + ',').concat(crtpoints);
        }
        if (add_hashvalue !== '') {
            result = result + ',' + add_hashvalue;
        }
        storage.setItemSync(crt_hashkey, result);
        result = ('{"allSnappedPoints":[').concat(result);
        result = result.concat(']}');
        /*fs = require('fs');
        fs.writeFile('../jsonView', result, function (err) {
            if (err)
                return console.log(err);
            console.log('Wrote result in file jsonView.txt, just check it');
        });*/
        last_hashkey = crt_hashkey;
        last_viewport = crt_viewport;
        callback(result);
    }
}

// Removes points in hashvalue that aren't contained in viewport
function splitPoints (hashvalue, viewport, callback) {
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
    callback(points.substring(21,points.length-2));
}

// Checks if data can be pulled from cache and returns the biggest hashValue contained in viewport
function cacheInCheck (viewport, callback) {
    let keys = storage.keys();
    let bestFit = [NaN,NaN];                                // First value represents the comparison value and the second value represents the best hashValue
    let result = '';
    for (let i = 0; i < keys.length; i++) {
        var viewport_key = getViewPortFromKey(keys[i]);
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
                    storage.getItem(bestFit[1], function(err, res) {
                        result = 'YES|' + res;
                        callback(result);
                    });
                }
            }
        }
    }
    if (isNaN(bestFit[0])) {
        callback('NOCACHE');
    } else if (result === '') {
        storage.getItem(bestFit[1], function(err, res) {
            result = 'NO|' + res;
            callback(result);
        });
    }
}

// Checks the hashValue containing the biggest part of the viewport
function cacheNearCheck (viewport, callback) {
    let keys = storage.keys();
    let bestFit = [NaN,NaN];                                // First value represents the comparison value and the second value represents the best hashValue
    for (let i = 0; i < keys.length; i++) {
        var viewport_key = getViewPortFromKey(keys[i]);
        let SW_lng = parseFloat(viewport_key.pop());
        let SW_lat = parseFloat(viewport_key.pop());
        let NE_lng = parseFloat(viewport_key.pop());
        let NE_lat = parseFloat(viewport_key.pop());
        let hash_points = [[NE_lat,NE_lng],[SW_lat,NE_lng],[SW_lat,SW_lng],[NE_lat,SW_lng]];
        let view_points = [viewport[0],viewport[1],[viewport[2],viewport[1]],[viewport[2],viewport[3]],[viewport[0],viewport[3]]];
        let points_in = pointsInViewport(hash_points, viewport);

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
                    break;
            case 1: for (let j = 0; j < 4; j++) {
                        if (points_in[j]) {
                            area = Math.abs((hash_points[j][0]-view_points[(j+2)%4][0]) * (hash_points[j][1]-view_points[(j+2)%4][1]));
                            break;
                        }
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
                    break;
            case 4: area = (NE_lat-SW_lat) * (NE_lng-SW_lng);
        }
        if (isNaN(bestFit[0]) || (area > bestFit[0])) {
            bestFit[0] = area;
            bestFit[1] = keys[i];
        }
    }
    if (isNaN(bestFit[0])) {
        callback('NONEAR');
    } else {
        storage.getItem(bestFit[1], function(err, res) {
            callback(res);
        });
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

function generator (event, NE_lat, NE_lng, SW_lat, SW_lng, callback) {

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

    switch(event) {
        case 'loca': loca(storage, callback); return;
        case 'zoom': zoom(storage, callback); return;
        case 'drag': drag(storage, callback); return;
    }



    // FIND ROADS via OpenStreetMap
    /*let headers = {'Content-Type':'application/json'};
    let options = {
        url: 'http://overpass-api.de/api/interpreter?data=[out:json];node('+SW_lat+','+SW_lng+','+NE_lat+','+NE_lng+');out;',
        method: 'GET',
        headers: headers,
    };
    request.get(options, function(error, response, body) {
        storage.setItemSync(hashkey,body);
        callback(body);
    });*/

    // NEAREST ROAD(S) FOUND TO POINTS version @google/maps client
    /*let googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyCtfkCcjL5cvhCb8cdncY95T4qLicNOYMU'
    });
    let json;
    googleMapsClient.nearestRoads({
        points: {
            lat: 46.61105834518564,
            lng: 6.88276125408936
        }
    },function(err,response){
        json = response.json.results;
    });*/

    // DIRECTION BETWEEN TWO POINTS
    /*let headers = {'Content-Type':'application/json'};
    let options = {
        url: 'https://maps.googleapis.com/maps/api/directions/json',
        method: 'GET',
        headers: headers,
        qs: {'origin':'46.60157247983388,6.869748830795288', 'destination':'46.5982994636952,6.863290071487427', 'mode':'driving', 'key':'AIzaSyCtfkCcjL5cvhCb8cdncY95T4qLicNOYMU'}
    };
    request.get(options, function(error, response, body) {
        callback(body);
    });*/

}