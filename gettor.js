module.exports.gettor = gettor;

function gettor(scenarioName, callback) {

    let IPAddress = '160.98.10.15';
    let request = require('request');
    let headers = {'Accept': 'application/json','Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
    let options = {
        url: 'http://' + IPAddress + ':1026/v2/entities?q=scenario==' + scenarioName,
        method: 'GET',
        headers: headers
    };
    request(options, function (error, response, body) {
        let entities = [];
        let locationValues;
        let timestampValues;
        let jsonresponse = JSON.parse(body);
        for (let i = 0; i < jsonresponse.length; i++) {
            headers = {'Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
            options = {
                url: 'http://' + IPAddress + ':8666/STH/v1/contextEntities/type/Vehicle/id/' + jsonresponse[i].id + '/attributes/location',
                method: 'GET',
                headers: headers,
                qs: {'lastN': 1000}
            };
            request(options, function (error, response, body) {
                locationValues = JSON.parse(body);
                headers = {'Fiware-Service': 'simtraf','Fiware-ServicePath': '/'};
                options = {
                    url: 'http://' + IPAddress + ':8666/STH/v1/contextEntities/type/Vehicle/id/' + jsonresponse[i].id + '/attributes/timestamp',
                    method: 'GET',
                    headers: headers,
                    qs: {'lastN': 1000}
                };
                request(options, function (error, response, body) {
                    timestampValues = JSON.parse(body);
                    let timelength = timestampValues.contextResponses[0].contextElement.attributes[0].values.length;
                    let locationlength = locationValues.contextResponses[0].contextElement.attributes[0].values.length;
                    let length = (timelength < locationlength)?timelength:locationlength;
                    let entityArray = [];
                    for (let j = 0; j < length; j++) {
                        let entity = jsonresponse[i];

                        let entityToDisplay = {
                            "id": entity.id,
                            "type": entity.type,
                            "brandName": entity.brandName.value,
                            "color": entity.color.value,
                            "location": locationValues.contextResponses[0].contextElement.attributes[0].values[j].attrValue,
                            "timestamp": timestampValues.contextResponses[0].contextElement.attributes[0].values[j].attrValue,
                            "vehiclePlateIdentifier": entity.vehiclePlateIdentifier.value,
                            "vehicleType": entity.vehicleType.value
                        };
                        entityArray.push(entityToDisplay);
                    }
                    entities.push(entityArray);
                    if (i === jsonresponse.length-1) {
                        callback(entities);
                    }
                    console.log("error " + error);
                    console.log("response " + JSON.stringify(response));
                    console.log("body " + body);
                });
                console.log("error " + error);
                console.log("response " + JSON.stringify(response));
                console.log("body " + body);
            });
        }
    });

}