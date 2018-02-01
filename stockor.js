module.exports.stockor = stockor;

let request = require('request');
let IPAddress = '160.98.10.15';
let IDSubscription;
let longestPath = 0;

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
    subscribe(function() {
        request(options, function (error, response, body) {
            for (let i = 0; i < pathes.length; i++) {
                if (pathes[i].length > longestPath) longestPath = pathes[i].length;
            }
            let waypoints = JSON.parse(startingpoints);
            waypoints.updateAction = "UPDATE";
            storeWayPoints(waypoints, pathes, 0, waypoints.contextElements[0].attributes[5].value, 0, callback);
        });
    });
}

function storeWayPoints(waypoints, pathes, i, d, statuscode, callback) {
    if (i === longestPath) {
        callback(statuscode);
    }
    let newWayPoints = waypoints;
    let date = new Date(new Date(d).getTime() + 2000*(i+1));
    for (let j = 0; j < waypoints.contextElements.length; j++) {
        if (i < pathes[j].length) {
            newWayPoints.contextElements[j].attributes[4].value = "" + JSON.parse(pathes[j][i]).lat + "," + JSON.parse(pathes[j][i]).lng;
        }
        newWayPoints.contextElements[j].attributes[5].value = date.toISOString();
    }
    let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: newWayPoints
    };
    request(options, function (error, response, body) {
        let jsonData = {
            "subscriptionId" : IDSubscription,
            "originator" : "orion.contextBroker.instance",
            "contextResponses" : []
        };
        for (let i = 0; i < waypoints.contextElements.length; i++) {
            jsonData.contextResponses.push({"contextElement": waypoints.contextElements[i], "statusCode": {"code": "200", "reasonPhrase": "OK"}});
        }
        options = {
            url: 'http://' + IPAddress + ':8666/notify',
            method: 'POST',
            headers: headers,
            json: jsonData
        };
        request(options, function(error, response, body) {
            storeWayPoints(waypoints, pathes, i+1, d, response.statusCode, callback);
        });
    });

}

function subscribe(callback) {
    let headers = {'Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v2/subscriptions',
        method: 'GET',
        headers: headers
    };
    request(options, function (error, response, body) {
        if (body === "[]" || body === undefined) {    // No subscription has been created
            let jsonData = {
                "entities": [{
                    "type": "Vehicle",
                    "isPattern": "true",
                    "id": "Vehicle*"
                }],
                "attributes": [
                    "location",
                    "timestamp"
                ],
                "reference": "http://" + IPAddress + ":8666/notify",
                "duration": "PT24H",
                "notifyConditions": [{
                    "type": "ONCHANGE",
                    "condValues": ["location","timestamp"]
                }]
            };
            headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
            options = {
                url: 'http://' + IPAddress + ':1026/v1/subscribeContext',
                method: 'POST',
                headers: headers,
                json: jsonData
            };
            request(options, function (error, response, body) {
                console.log(error);
                IDSubscription = body.subscribeResponse.subscriptionId;
                callback();
            });
        } else {            // Subscription found
            let subscription = JSON.parse(body)[0];
            IDSubscription = subscription.id;
            if (subscription.status === "active") {
                callback();
            } else {
                let jsonData = {
                    "subscriptionId": IDSubscription,
                    "duration": "PT24H"
                };
                headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
                options = {
                    url: 'http://' + IPAddress + ':1026/v1/updateContextSubscription',
                    method: 'POST',
                    headers: headers,
                    json: jsonData
                };
                request(options, function (error, response, body) {
                    callback();
                });
            }
        }
    });
}