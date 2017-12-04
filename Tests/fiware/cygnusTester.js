cygnusTester();

function cygnusTester() {
    let request = require('request');
    let headers = { 'Content-Type': 'application/json',
        'Fiware-Service' : 'mobicam',
        'Fiware-ServicePath' : '/fribourg/test0'};
    let options = {
        url: 'http://inuit-labs.ing.he-arc.ch/cygnus',
        method: 'POST',
        headers: headers,
    };
    request(options, function (error, response) {
        if (!error && response.statusCode === 200) {
        console.log("Cygnus access");

        } else {
            console.log("Can't access cygnus");
        }
    });
}