module.exports.pathFinder = pathFinder;

let gen = require('./generator.js');
let request = require('request');

function pathFinder(v, points, scenario, callback) {
    let vehicles = JSON.parse(v);
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
            callDirectionsAPI(vehicles, 0, 0);
            function callDirectionsAPI(vehicles, i, j) {
                if (i === vehicles.allSnappedPoints.length) {
                    console.log(pathes);
                    callback([vehicles, pathes]);
                    return;
                } else if (j === vehicles.allSnappedPoints[i].snappedPoints.length) {
                    callDirectionsAPI(vehicles, i+1, 0);
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
                    console.log("body = " + body);
                    pathes.push(JSON.stringify(body));
                    callDirectionsAPI(vehicles, i, j+1);
                });
            }
    }
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