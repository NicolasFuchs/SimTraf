let request = require('request');
let jsonData;
let headers;
let options;
let IPaddress;
let vehicleID;
let subscriptionId;

/**********************************************************************************************************************/
/*******************************************************  Orion  ******************************************************/
/**********************************************************************************************************************/

/*******************************  API version 1  *******************************/

function o_deletion() {
    jsonData = {
        "contextElements":[{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID
        }],
        "updateAction": "DELETE"
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    // convenience operation
    /*options = {
        url: 'http://' + IPaddress + ':1026/v1/contextEntities/' + vehicleID,
        method: 'DELETE',
        headers: headers,
    };*/
    request(options, function (error, response) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
    });
}

function o_creation() {
    jsonData = {
        "contextElements":[{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID,
            "attributes": [
                {"name": "vehiclePlateIdentifier","type": "string","value": "VD117465"},
                {"name": "vehicleType","type": "string","value": "Car"},
                {"name": "brandName","type": "string","value": "BMW"},
                {"name": "color","type": "string","value": "#ff0000"},
                {"name": "location","type": "geo:point","value": "46.602368588999056,6.864985227584839"},
                {"name": "timestamp","type": "Date","value": new Date("20 December 2017 08:00 UTC").toISOString()}
            ]
        }],
        "updateAction": "APPEND"
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    // convenience operation
    /*jsonData = {
        "id": vehicleID,
        "type": "Vehicle",
        "attributes": [
            {"name": "vehiclePlateIdentifier","type": "string","value": "VD117465"},
            {"name": "vehicleType","type": "string","value": "Car"},
            {"name": "brandName","type": "string","value": "BMW"},
            {"name": "color","type": "string","value": "#ff0000"},
            {"name": "location","type": "geo:point","value": "46.602368588999056,6.864985227584839"},
            {"name": "timestamp","type": "Date","value": new Date("20 December 2017 08:00 UTC").toISOString()}
        ]
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v1/contextEntities',
        method: 'POST',
        headers: headers,
        json: jsonData
    };*/
    options = {
        url: 'http://' + IPaddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}

function o_update() {
    jsonData = {
        "contextElements": [{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID,
            "attributes": [{"name": "location","type": "geo:point","value": "46.603518503807436,6.873139142990112"}]
        }],
        "updateAction": "UPDATE"
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    // convenience operation
    /*jsonData = {
        "attributes": [{
            "name": "location",
            "type": "geo:point",
            "value": "46.603518503807436,6.873139142990112"
        }]
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v1/contextEntities/' + vehicleID + '/attributes',
        method: 'PUT',
        headers: headers,
        json: jsonData
    };*/
    options = {
        url: 'http://' + IPaddress + ':1026/v1/updateContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}

function o_retrieval() {
    jsonData = {
        "entities":[{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID
        }]
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    // convenience operation
    /*options = {
        url: 'http://' + IPaddress + ':1026/v1/contextEntities/' + vehicleID,
        method: 'GET',
        headers: headers
    };*/
    options = {
        url: 'http://' + IPaddress + ':1026/v1/queryContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}

/*******************************  API version 2  *******************************/
/*
function o_deletion() {
    headers = {
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/entities/' + vehicleID,
        method: 'DELETE',
        headers: headers
    };
    request(options, function (error, response) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
    });
}

function o_creation() {
    let jsonData = {
        "id": vehicleID,
        "type": "Vehicle",
        "vehiclePlateIdentifier": {
            "type": "string",
            "value": "VD117465"
        },
        "vehicleType": {
            "type": "string",
            "value": "Car"
        },
        "brandName": {
            "type": "string",
            "value": "BMW"
        },
        "color": {
            "type": "string",
            "value": "#ff0000"
        },
        "location": {
            "type": "geo:point",
            "value": "46.602368588999056,6.864985227584839"
        },
        "timestamp": {
            "type": "Date",
            "value": new Date("20 December 2017 08:00 UTC").toISOString()//new Date().toISOString()
        }
    };
    headers = {
        'Content-Type': 'application/json',
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/entities',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
    });
}

function o_update() {
    let jsonData = {
        "vehiclePlateIdentifier": {
            "type": "string",
            "value": "VD117465"
        },
        "vehicleType": {
            "type": "string",
            "value": "Car"
        },
        "brandName": {
            "type": "string",
            "value": "BMW"
        },
        "color": {
            "type": "string",
            "value": "#ff0000"
        },
        "location": {
            "type": "geo:point",
            "value": "46.603518503807436,6.873139142990112"
        },
        "timestamp": {
            "type": "Date",
            "value": new Date("20 December 2017 08:00 UTC").toISOString()//new Date().toISOString()
        }
    };
    headers = {
        'Content-Type': 'application/json',
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/entities/' + vehicleID + '/attrs',
        method: 'PATCH',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + body);
    });
}

function o_retrieval() {
    headers = {
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/entities/' + vehicleID,
        method: 'GET',
        headers: headers
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + response);
        console.log("body " + body);
    });
}
*/
/**********************************************************************************************************************/
/**************************************************  Orion and Cygnus  ************************************************/
/**********************************************************************************************************************/

/*******************************  API version 1  *******************************/

function linkOrionToCygnus() {
    let jsonData = {
        "entities": [{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID
        }],
        "attributes": [
            "location"
        ],
        "reference": "http://" + IPaddress + ":5050/notify",
        "duration": "PT24H",
        "notifyConditions": [{
            "type": "ONCHANGE",
            "condValues": ["location"]
        }]
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':1026/v1/subscribeContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}

/*******************************  API version 2  *******************************/
/*
function linkOrionToCygnus() {
    let jsonData = {
        "description": "A subscription to get info about " + vehicleID,
        "subject": {
            "entities": [{
                    "id": vehicleID,
                    "type": "Vehicle"
            }],
            "condition": {"attrs": ["location"]}
        },
        "notification": {
            "http": {"url": "http://" + IPaddress + ":5050/notify"},
            "attrs": ["location"]
        },
        "expires": "2040-01-01T14:00:00.00Z"
    };
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/subscriptions',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}
*/
/**********************************************************************************************************************/
/****************************************************  Orion and STH  *************************************************/
/**********************************************************************************************************************/

/*******************************  API version 1  *******************************/

function linkOrionToSTH() {
    let jsonData = {
        "entities": [{
            "type": "Vehicle",
            "isPattern": "false",
            "id": vehicleID
        }],
        "attributes": [
            "location"
        ],
        "reference": "http://" + IPaddress + ":8666/notify",
        "duration": "PT24H",
        "notifyConditions": [{
            "type": "ONCHANGE",
            "condValues": ["location"]
        }]
    };
    headers = {'Content-Type': 'application/json','Accept': 'application/json','Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':1026/v1/subscribeContext',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}

/*******************************  API version 2  *******************************/
/*
function linkOrionToSTH() {
    let jsonData = {
        "description": "A subscription to get info about " + vehicleID,
        "subject": {
            "entities": [{
                    "id": vehicleID,
                    "type": "Vehicle"
            }],
            "condition": {"attrs": ["location"]}
        },
        "notification": {
            "http": {"url": "http://" + IPaddress + ":8666/notify"},
            "attrs": ["location"]
        },
        "expires": "2040-01-01T14:00:00.00Z",
    };
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Fiware-Service': 'SIMTRAF',
        'Fiware-ServicePath': '/'
    };
    options = {
        url: 'http://' + IPaddress + ':1026/v2/subscriptions',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + JSON.stringify(body));
    });
}
*/
/**********************************************************************************************************************/
/******************************************************  STH-Comet  ***************************************************/
/**********************************************************************************************************************/

/*******************************  API version 1  *******************************/

function s_retrieval() {
    headers = {'Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':8666/STH/v1/contextEntities/type/Vehicle/id/' + vehicleID + '/attributes/location',
        method: 'GET',
        headers: headers,
        qs: {/*'hLimit': 10, 'hOffset': 0,*/'lastN': 10/*, 'dateFrom': new Date("19 December 2017 08:00 UTC").toISOString(), 'dateTo': new Date("21 December 2017 08:00 UTC").toISOString()*/}
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + body);
    });
}

function s_deletion() {
    headers = {'Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':8666/STH/v1/contextEntities',
        method: 'DELETE',
        headers: headers
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
    });
}

function s_notification() {
    jsonData = {
        "subscriptionId" : subscriptionId,
        "originator" : "orion.contextBroker.instance",
        "contextResponses" : [{
            "contextElement" : {
                "attributes" : [
                    {
                        "name" : "location",
                        "type" : "geo:point",
                        "value" : "46.599184082148774,6.86445951461792"
                    }
                ],
                "type" : "Vehicle",
                "isPattern" : "false",
                "id" : vehicleID
            },
            "statusCode" : {
                "code" : "200",
                "reasonPhrase" : "OK"
            }
        }]
    };
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Fiware-Service': 'SIMTRAF','Fiware-ServicePath': '/'};
    options = {
        url: 'http://' + IPaddress + ':8666/notify',
        method: 'POST',
        headers: headers,
        json: jsonData
    };
    request(options, function (error, response, body) {
        console.log("error " + error);
        console.log("response " + JSON.stringify(response));
        console.log("body " + body);
    });
}

/**********************************************************************************************************************/
/*******************************************************  Testing  ****************************************************/
/**********************************************************************************************************************/

vehicleID = 'Car2';
IPaddress = '160.98.10.15';
subscriptionId = '5a3b94efa9019d35cbd89acb';

o_deletion();
//o_creation();
//o_update();
//o_retrieval();

//linkOrionToCygnus();
//linkOrionToSTH();

//s_deletion();
//s_retrieval();
//s_notification();