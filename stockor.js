module.exports.stockor = stockor;

let request = require('request');
let IPAddress = '160.98.10.15';
let longestPath = 0;

/*let vehiclesandpathes = [
    {
        "contextElements":[
            {
                "type":"Vehicle",
                "isPattern":"false",
                "id":"Car1",
                "attributes":[
                    {"name":"vehiclePlateIdentifier","type":"string","value":"VD000000"},
                    {"name":"vehicleType","type":"string","value":"Car"},
                    {"name":"brandName","type":"string","value":"BMW"},
                    {"name":"color","type":"string","value":"#ff0000"},
                    {"name":"location","type":"geo:point","value":"46.000000,6.000000"},
                    {"name":"timestamp","type":"Date","value":new Date("20 December 2000 20:00 UTC").toISOString()},
                ]
            },
            {
                "type":"Vehicle",
                "isPattern":"false",
                "id":"Car2",
                "attributes":[
                    {"name":"vehiclePlateIdentifier","type":"string","value":"VD888888"},
                    {"name":"vehicleType","type":"string","value":"Car"},
                    {"name":"brandName","type":"string","value":"Mercedes"},
                    {"name":"color","type":"string","value":"#000000"},
                    {"name":"location","type":"geo:point","value":"47.000000,7.000000"},
                    {"name":"timestamp","type":"Date","value":new Date("20 December 2000 20:00 UTC").toISOString()},
                ]
            }
        ],
        "updateAction":"APPEND"
    },
    [[{"lat":46.100000,"lng":6.100000},{"lat":46.200000,"lng":6.200000}],[{"lat":47.100000,"lng":7.100000},{"lat":47.200000,"lng":7.200000},{"lat":47.300000,"lng":7.300000}]]
];
vehiclesandpathes[0] = JSON.stringify(vehiclesandpathes[0]);
let callback = function(msg) {
    console.log(msg);
};*/

//stockor(vehiclesandpathes, callback);
retrieval();

function stockor(vehiclesandpathes, callback) {
    let startingpoints = vehiclesandpathes[0];
    let pathes = vehiclesandpathes[1];

    let jsonData = JSON.parse(startingpoints);
    let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        for (let i = 0; i < pathes.length; i++) {
            if (pathes[i].length > longestPath) longestPath = pathes[i].length;
        }
        let waypoints = JSON.parse(startingpoints);
        waypoints.updateAction = "UPDATE";
        storeWayPoints(waypoints, pathes, 0, waypoints.contextElements[0].attributes[5].value, 0, callback);
    });
}

function storeWayPoints(waypoints, pathes, i, d, statuscode, callback) {
    if (i === longestPath) {
        callback(statuscode); return;
    }
    let newWayPoints = waypoints;
    let date = new Date(new Date(d).getTime() + 2000*(i+1));
    for (let j = 0; j < waypoints.contextElements.length; j++) {
        if (i < pathes[j].length) {
            newWayPoints.contextElements[j].attributes[4].value = "" + pathes[j][i].lat + "," + pathes[j][i].lng;
        }
        newWayPoints.contextElements[j].attributes[5].value = date.toISOString();
    }
    let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: newWayPoints
    };
    request(options, function (error, response, body) {
        storeWayPoints(waypoints, pathes, i+1, date, response.statusCode, callback);
    });

}

function retrieval() {
    let jsonData = {
        "entities":[{
            "type": "Vehicle",
            "isPattern": "true",
            "id": "Car*"
        }]
    };
    let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v1/queryContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("body " + JSON.stringify(body));
    });
}