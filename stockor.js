module.exports.stockor = stockor;

let request = require('request');
let IPAddress = '160.98.10.15';
let IDSubscription;
let longestPath = 0;

function stockor(vehiclesandpathes, callback) {
    let startingpoints = vehiclesandpathes[0];
    console.log("In stockor : startingpoints = " + startingpoints);
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

function deletesub(subscription) {
    let headers = {'Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v2/subscriptions/' + subscription,
        method: 'DELETE',
        headers: headers
    };
    request(options, function (error, response, body) {
        console.log("error : " + error);
        console.log("response : " + response);
        console.log("body : " + body);
    });
}

function getsub() {
    let headers = {'Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v2/subscriptions',
        method: 'GET',
        headers: headers
    };
    request(options, function (error, response, body) {
        console.log("body : " + body);
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

function retrieval_Orion(wantTodelete) {
    let jsonData = {
        "entities":[{
            "type": "Vehicle",
            "isPattern": "true",
            "id": "Vehicle*"
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
        if (wantTodelete && !body.hasOwnProperty('errorCode')) {
            let IDList = [];
            for (let i = 0; i < body.contextResponses.length; i++) {
                IDList.push(body.contextResponses[i].contextElement.id);
            }
            deletion_Orion(IDList);
        }
    });
}

function deletion_Orion(IDList) {
    if (IDList.length > 0) {
        let VehicleID = IDList.pop();
        let jsonData = {"contextElements": [{"type": "Vehicle","isPattern": "false","id": VehicleID}],"updateAction": "DELETE"};
        let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
        let options = {url: 'http://' + IPAddress + ':1026/v1/updateContext',method: 'POST',headers: headers,json: jsonData};
        request(options, function (error, response) {
            console.log("error " + error);
            console.log("response " + JSON.stringify(response));
            deletion_Orion(IDList);
        });
    }
}

function retrieval_STH(VehicleID) {
    let headers = {'Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':8666/STH/v1/contextEntities/type/Vehicle/id/' + VehicleID + '/attributes/location',
        method: 'GET',
        headers: headers,
        qs: {'lastN': 1000000}
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + body);
    });
}

function deletion_STH() {
    let headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':8666/STH/v1/contextEntities',
        method: 'DELETE',
        headers: headers
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + body);
    });
}

//getsub();
//deletesub('5a55e76859b158b64df9e9ba');
//retrieval_Orion(true);
//retrieval_Orion(false);
//deletion_STH();
//retrieval_STH('Vehicle425513');
//getsub();
//stockor(vehiclesandpathes, function(msg){ console.log(msg);});