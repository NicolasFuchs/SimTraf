// return an empty array of points
callback('{"allSnappedPoints":[{"snappedPoints":[]}]}');


/**********************************************************************************************************************/


// To be placed in mulReqCaller to display grids of points
let startLength = points.length;
let gridPoints = '{"snappedPoints":[';
while(points.length > 0) {
    if (startLength !== points.length) {
        gridPoints = gridPoints.concat(',');
    }
    gridPoints = gridPoints.concat('{"location":{"latitude":');
    gridPoints = gridPoints.concat(points.pop()); gridPoints = gridPoints.concat(',"longitude":');
    gridPoints = gridPoints.concat(points.pop()); gridPoints = gridPoints.concat('}}');
}
gridPoints = gridPoints.concat(']}');
storage.setItemSync(crt_hashkey, gridPoints);
gridPoints = gridPoints.concat(']}');
gridPoints = ('{"allSnappedPoints":[').concat(gridPoints);
last_viewport = crt_viewport;
module.exports.last_viewport = last_viewport;
callback(gridPoints);


/**********************************************************************************************************************/


// Write to file
fs = require('fs');
fs.writeFile('../jsonView', result, function (err) {
    if (err)
        return console.log(err);
    console.log('Wrote result in file jsonView.txt, just check it');
});


/**********************************************************************************************************************/


// Request for direction between 2 points
let headers = {'Content-Type':'application/json'};
let options = {
    url: 'https://maps.googleapis.com/maps/api/directions/json',
    method: 'GET',
    headers: headers,
    qs: {'origin':'46.60157247983388,6.869748830795288', 'destination':'46.5982994636952,6.863290071487427', 'mode':'driving', 'key':APIkey}
};
request.get(options, function(error, response, body) {
    callback(body);
});


/**********************************************************************************************************************/


// Request to find points on roads via OpenStreetMap
let headers = {'Content-Type':'application/json'};
let options = {
    url: 'http://overpass-api.de/api/interpreter?data=[out:json];node('+SW_lat+','+SW_lng+','+NE_lat+','+NE_lng+');out;',
    method: 'GET',
    headers: headers,
};
request.get(options, function(error, response, body) {
    storage.setItemSync(hashkey,body);
    callback(body);
});


/**********************************************************************************************************************/


// Delete some JSON elements
let points =    '{"allSnappedPoints":[{"snappedPoints": [' +
                '{"location": {"latitude": 46,"longitude": 7}},' +
                '{"location": {"latitude": 45,"longitude": 7}},' +
                '{"location": {"latitude": 47,"longitude": 5}},' +
                '{"location": {"latitude": 45.5,"longitude": 8}}' + ']}]}';
points = JSON.parse(points);
for (let i = 0; i < points.allSnappedPoints.length; i++) {
    for (let j = 0; j < points.allSnappedPoints[i].snappedPoints.length; j++) {
        let point = points.allSnappedPoints[i].snappedPoints[j];
        let point_lat = point.location.latitude;
        let point_lng = point.location.longitude;
        if (point_lat < 45.8 || point_lat > 50 || point_lng < 3 || point_lng > 10) {
            points.allSnappedPoints[i].snappedPoints.splice(j,1);
            j--;
        }
    }
}


/**********************************************************************************************************************/


// Granularity explanation
const map_diff_lat = 0.02211494699;
const map_diff_lng = 0.03218650819;
const granularity = 5000;           // On the default zoom level, 100 x 100 points are captured for ~ delta_lat = 0.02 and delta_lng = 0.02


/**********************************************************************************************************************/


// Usage of Orion context broker API version 2 - Context Creation
url: 'http://inuit-labs.ing.he-arc.ch/orion/v2/entities'
// Usage of Orion context broker API version 2 - Context Query
url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/contextEntities/Car4'