module.exports = zoom;

let gen = require('./generator.js');

function zoom(storage, callback) {

    // Test to delete some JSON elements
    /***********************************************************************************************/
    /*let points =    '{"allSnappedPoints":[{"snappedPoints": [' +
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
    console.log('*********************************************************************************');
    console.log(JSON.stringify(points));
    console.log('*********************************************************************************');
    */
    /***********************************************************************************************/

    let crt_hashkey = gen.crt_hashkey;
    let crt_viewport = gen.crt_viewport;
    let last_viewport = gen.last_viewport;
    let NE_lng = gen.crt_viewport[1];
    let SW_lng = gen.crt_viewport[3];
    if (last_viewport[1]-last_viewport[3] > NE_lng - SW_lng) {              // Zoom in
        gen.cacheInCheck(crt_viewport, function(res) {
            if (res !== 'NOCACHE') {
                let restab = res.split('|');
                if (restab[0] === 'NO') {                                   // res fit easily in viewport
                    //console.log("Should be here !");
                    gen.splitPoints(restab[1], crt_viewport, function(res) {
                        storage.setItem(crt_hashkey, res, function() {
                            let hashvalue = ('{"allSnappedPoints":[').concat(res);
                            hashvalue = hashvalue.concat(']}');
                            callback(hashvalue);
                        });
                    });
                } else if (restab[0] === 'YES') {                           // res fit exactly in viewport
                    //console.log("Shouldn't be here !");
                    storage.setItem(crt_hashkey, restab[1], function() {
                        let hashvalue = ('{"allSnappedPoints":[').concat(restab[1]);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                }
            } else {
                console.log('An error occured in the storage !');
            }
        });
    } else {                                                                // Zoom out
        gen.cacheInCheck(crt_viewport, function(res) {
            if (res !== 'NOCACHE') {
                let restab = res.split('|');
                if (restab[0] === 'NO') {                                   // res fit easily in viewport
                    //console.log('should go here');
                    gen.splitPoints(restab[1], crt_viewport, function(res) {
                        storage.setItem(crt_hashkey, res, function() {
                            callback(res);
                        });
                    });
                } else if (restab[0] === 'YES') {                           // res fit exactly in viewport
                    storage.setItem(crt_hashkey, restab[1], function () {
                        hashvalue = ('{"allSnappedPoints":[').concat(restab[1]);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                }
            } else {                                                        // Some points around the last_viewport hasn't been searched
                gen.cacheNearCheck(crt_viewport, function(res) {
                    //console.log(res);
                });
                for (let k = 0; k < 4; k++) {
                    let gran_lat, gran_lng;
                    if (k % 2 === 0) {
                        gran_lat = parseInt(Math.abs(viewport[k]-res[k]) * granularity / map_diff_lat);
                        gran_lng = parseInt(Math.abs(res[1]-res[3]) * granularity / map_diff_lng);
                        delta_lat = parseInt(Math.abs(viewport[k]-res[k]) / gran_lat);
                        delta_lng = parseInt(Math.abs(res[1]-res[3]) / gran_lng);
                    } else {
                        gran_lat = parseInt(Math.abs(viewport[0]-viewport[2]) * granularity / map_diff_lat);
                        gran_lng = parseInt(Math.abs(viewport[k]-res[k]) * granularity / map_diff_lng);
                        delta_lat = parseInt(Math.abs(viewport[0]-viewport[2]) / gran_lat);
                        delta_lng = parseInt(Math.abs(viewport[k]-res[k]) / gran_lng);
                    }

                    switch (k) {
                        case 0: last_lat = res[0]; last_lng = res[3]; break;
                        case 1: last_lat = SW_lat; last_lng = res[1]; break;
                        case 2: last_lat = SW_lat; last_lng = res[3]; break;
                        case 3: last_lat = SW_lat; last_lng = SW_lng;
                    }

                    for (i = 0; i < gran_lat; i++) {
                        for (j = 0; j < gran_lng; j++) {
                            new_lng = last_lng + delta_lng;
                            points.push(new_lng);
                            points.push(last_lat);
                            last_lng = new_lng;
                        }
                        last_lat += delta_lat;
                        switch (k) {
                            case 0: last_lng = res[3]; break;
                            case 1: last_lng = res[1]; break;
                            case 2: last_lng = res[3]; break;
                            case 3: last_lng = SW_lng;
                        }
                    }
                }
            }
        });
        //callback('{"allSnappedPoints":[{"snappedPoints": []}]}');
    }
}