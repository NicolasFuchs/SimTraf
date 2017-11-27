module.exports = fiwareStorageTester;

function fiwareStorageTester() {
    let request = require('request');
    let headers = { 'Content-Type': 'application/json',
        'Fiware-Service' : 'mobicam',
        'Fiware-ServicePath' : '/fribourg/test0'};
    let data = '{ \
        "contextElements": [ \
            { \
                "type": "Vehicle", \
                "isPattern": "false", \
                "id": "Car1", \
                "attributes": [ \
                    { \
                        "name": "brandName", \
                        "type": "string", \
                        "value": "BMW" \
                    }, \
                    { \
                        "name": "color", \
                        "type": "string", \
                        "value": "#ff0000" \
                    } \
                ] \
            } \
        ], \
        "updateAction": "APPEND" \
    }';
    let options = {
        url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/updateContext',
        //url: 'http://inuit-labs.ing.he-arc.ch/orion/v2/entities', syntaxe de la version 2
        method: 'POST',
        headers: headers,
        body: data
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Storage body : " + body);
            data = '{ \
                "entities": [ \
                    { \
                        "type": "Vehicle", \
                        "isPattern": "false", \
                        "id": "Car1" \
                    } \
                ] \
            }';
            options = {
                url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/queryContext',
                //url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/contextEntities/Car1', syntaxe plus simple mais qui ne fonctionne pas
                method: 'POST',
                headers: headers,
                body: data
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log("Retrieval body : " + body);
                    let jsonBody = JSON.parse(body);
                    for (let i = 0; i < jsonBody.contextResponses.length; i++) {
                        console.log(jsonBody.contextResponses[i]);
                    }
                } else {
                    console.log("Retrieval : An issue has occured");
                }
            });

        } else {
            console.log("Storage : An issue has occured");
        }
    });
}