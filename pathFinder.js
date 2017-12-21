module.exports.pathFinder = pathFinder;

let gen = require('./generator.js');
let request = require('request');

function pathFinder(v, points, scenario, callback) {
    let pathes = [];
    switch(scenario) {
        case "cut" : // car_usual_traffic
            break;
        case "aut" : // all_usual_traffic
            break;
        case "act" : // all_congested_traffic
            break;
        case "aup" : // all_usual_parking
            break;
        case "cmt" : // car_min_timing

            let meetingPoint = findACenteredPoint(points);
            let destination = (meetingPoint[0].toString()).concat(',');
            destination += meetingPoint[1];
            callDirectionsAPI(v, 0, 0);
            function callDirectionsAPI(v, i, j) {
                let vehicles = JSON.parse(v);
                if (i === vehicles.allSnappedPoints.length) {
                    //callback([v, pathes]);
                    callback([v, buildFullPathes(pathes)]);
                    return;
                } else if (j === vehicles.allSnappedPoints[i].snappedPoints.length) {
                    callDirectionsAPI(v, i+1, 0);
                    return;
                }
                let point = vehicles.allSnappedPoints[i].snappedPoints[j];
                let origin = point.location.latitude + "," + point.location.longitude;
                let headers = {'Content-Type': 'application/json'};
                let options = {
                    url: 'https://maps.googleapis.com/maps/api/directions/json',
                    method: 'GET',
                    headers: headers,
                    qs: {'origin': origin, 'destination': destination, 'mode': 'driving', 'key': gen.APIkey}
                };
                request.get(options, function (error, response, body) {
                    pathes.push(body);
                    callDirectionsAPI(v, i, j+1);
                });
            }
    }
}

// Google Maps Directions API responds too few points with the steps to have a real vehicle movement, polyline attribute of the response has to be used and some points added
function buildFullPathes(pathes) {
    console.log("pathes " + pathes);
    let decodePolyline = require('decode-google-map-polyline');
    let allPathes = [];
    let path = [];
    for (let p = 0; p < pathes.length; p++) {
        let jsonPath = JSON.parse(pathes[p]);
        path = [];
        for (let r = 0; r < jsonPath.routes.length; r++) {
            for (let l = 0; l < jsonPath.routes[r].legs.length; l++) {
                for (let s = 0; s < jsonPath.routes[r].legs[l].steps.length; s++) {
                    console.log(decodePolyline(jsonPath.routes[r].legs[l].steps[s].polyline.points));
                    path = path.concat(decodePolyline(jsonPath.routes[r].legs[l].steps[s].polyline.points));
                }
            }
        }
        for (let i = 0; i < path.length; i++) {
            path[i] = JSON.stringify(path[i]);
        }
        allPathes.push(path);
    }
    console.log("ALLPATHES ");
    for (let i = 0; i < allPathes.length; i++) {
        console.log("CASE " + i);
        console.log(allPathes[i]);
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
    jsonpoints = JSON.parse(points);
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