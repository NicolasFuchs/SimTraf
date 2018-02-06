module.exports.pathFinder = pathFinder;

let gen = require('./generator.js');
let request = require('request');

function pathFinder(v, points, scenario, callback) {

    let pathes = [];
    switch(scenario) {
        case "car usual transit" :
            break;
        case "all usual transit" :
            break;
        case "all congested transit" :
            break;
        case "all usual parking" :
            break;
        case "car minimal timing" :
            let meetingPoint = findACenteredPoint(points);
            let destination = (meetingPoint[0].toString()).concat(',');
            destination += meetingPoint[1];
            callDirectionsAPI(v, 0);
            function callDirectionsAPI(v, i) {
                let vehicles = JSON.parse(v);
                if (i === vehicles.contextElements.length) {
                    callback([v, buildFullPathes(pathes)]); return;
                }
                let origin = vehicles.contextElements[i].attributes[4].value;

                let headers = {'Content-Type': 'application/json'};
                let options = {
                    url: 'https://maps.googleapis.com/maps/api/directions/json',
                    method: 'GET',
                    headers: headers,
                    qs: {'origin': origin, 'destination': destination, 'mode': 'driving', 'key': gen.APIkey}
                };
                request.get(options, function (error, response, body) {
                    pathes.push(body);
                    callDirectionsAPI(v, i+1);
                });
            }
    }
}

// Google Maps Directions API responds too few points with the steps to have a real vehicle movement, polyline attribute of the response has to be used and some points added
function buildFullPathes(pathes) {
    let decodePolyline = require('decode-google-map-polyline');
    let allPathes = [];
    let path = [];
    for (let p = 0; p < pathes.length; p++) {
        let jsonPath = JSON.parse(pathes[p]);
        path = [];
        for (let r = 0; r < jsonPath.routes.length; r++) {
            for (let l = 0; l < jsonPath.routes[r].legs.length; l++) {
                for (let s = 0; s < jsonPath.routes[r].legs[l].steps.length; s++) {
                    path = path.concat(decodePolyline(jsonPath.routes[r].legs[l].steps[s].polyline.points));
                }
            }
        }
        for (let i = 0; i < path.length; i++) {
            path[i] = JSON.stringify(path[i]);
        }
        allPathes.push(path);
    }
    return allPathes;
}

// Finds a random point in a centered square on the map
function findACenteredPoint(points) {
    let meetingPoint;
    let t = gen.crt_viewport[0]-(1/4)*(gen.crt_viewport[0]-gen.crt_viewport[2]);
    let r = gen.crt_viewport[1]-(1/4)*(gen.crt_viewport[1]-gen.crt_viewport[3]);
    let b = gen.crt_viewport[2]+(1/4)*(gen.crt_viewport[0]-gen.crt_viewport[2]);
    let l = gen.crt_viewport[3]+(1/4)*(gen.crt_viewport[1]-gen.crt_viewport[3]);
    let centeredPoints = [];
    let jsonpoints = JSON.parse(points);
    for (let i = 0; i < jsonpoints.allSnappedPoints.length; i++) {
        for (let j = 0; j < jsonpoints.allSnappedPoints[i].snappedPoints.length; j++) {
            let point = jsonpoints.allSnappedPoints[i].snappedPoints[j];
            if (point.location.latitude >= b && point.location.latitude <= t && point.location.longitude >= l && point.location.longitude <= r) {
                centeredPoints.push(point.location.latitude);
                centeredPoints.push(point.location.longitude);
            }
        }
    }
    let randomIndex = 2*Math.floor(Math.random()*centeredPoints.length/2);
    meetingPoint = [centeredPoints[randomIndex], centeredPoints[randomIndex+1]];
    return meetingPoint;
}