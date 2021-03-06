let request = require('request');

let jsonData = {
    "services": [{
        "apikey":"simtrafkey",
        "cbroker": "http://0.0.0.0:1026",
        "entity_type": "Vehicle",
        "resource": "/iot/d"
    }]
};

let headers = {
    'Content-Type': 'application/json',
    'Fiware-Service': 'SIMTRAF',
    'Fiware-ServicePath': '/'
};
let options = {
    url: 'http://160.98.10.15:4041/iot/services',
    method: 'POST',
    headers: headers,
    body: JSON.stringify(jsonData)
};
request.post(options, function (error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);
});