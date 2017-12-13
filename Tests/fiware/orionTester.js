orionTester();

function orionTester() {
    let request = require('request');

    let deletedata = '{ \
        "contextElements": [\
            {\
            "type": "Vehicle",\
            "isPattern": "false",\
            "id":"Car1"\
            }\
        ],\
        "updateAction": "DELETE"\
    }';

    let data = '{ \
        "contextElements":[ \
            { \
                "type": "Vehicle", \
                "isPattern": "false", \
                "id": "Car4", \
                "attributes": [ \
                    {   "name": "brandName", \
                        "type": "string", \
                        "value": "BMW" \
                    }, \
                    { \
                        "name": "color", \
                        "type": "string", \
                        "value": "#ff0000" \
                    }, \
                    { \
                        "name": "location", \
                        "type": "geo:point", \
                        "value": "46.602368588999056,6.864985227584839" \
                    }, \
                    { \
                        "name": "vehiclePlateIdentification", \
                        "type": "string", \
                        "value": "VD117465" \
                    } \
                ] \
            } \
        ], \
        "updateAction": "UPDATE" \
    }';

    let jsondata = {
        "contextElements":[
            {
                "type": "Vehicle",
                "isPattern": "false",
                "id": "Car4",
                "attributes": [
                    {   "name": "brandName",
                        "type": "string",
                        "value": "BMW"
                    },
                    {
                        "name": "color",
                        "type": "string",
                        "value": "#ff0000"
                    },
                    {
                        "name": "location",
                        //"type": "geo:json",
                        //"type": "json",
                        //"value": {"type": "Point", "coordinates": [46.602368588999056,6.864985227584839]}
                        "type": "geo:point",
                        "value": "46.602368588999056,6.864985227584839"
                    },
                    {
                        "name": "timestamp",
                        "type": "Date",
                        "value": Date.now().toString()
                    },
                    {
                        "name": "vehiclePlateIdentifier",
                        "type": "string",
                        "value": "VD117465"
                    }
                ]
            }
        ],
        "updateAction": "APPEND"
    };

    let headers = { 'Content-Type': 'application/json',
                    'Fiware-Service' : 'mobicam',
                    'Fiware-ServicePath' : '/fribourg/test0'};

    let options = {
        url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/updateContext',
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsondata)
    };
    request(options, function (error, response, body) {
        //console.log(error); console.log(response);
        if (!error && response.statusCode === 200) {
            console.log("Storage body : " + body);
            data = '{ \
                "entities": [ \
                    { \
                        "type": "Vehicle", \
                        "isPattern": "false", \
                        "id": "Car4" \
                    } \
                ] \
            }';
            options = {
                url: 'http://inuit-labs.ing.he-arc.ch/orion/v1/queryContext',
                method: 'POST',
                headers: headers,
                body: data
            };
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log("Retrieval body : " + body);
                    /*let jsonBody = JSON.parse(body);
                    for (let i = 0; i < jsonBody.contextResponses.length; i++) {
                        console.log(jsonBody.contextResponses[i].contextElement.attributes);
                    }*/
                } else {
                    console.log("Retrieval : An issue has occured");
                }
            });

        } else {
            console.log("Storage : An issue has occured");
        }
    });
}