module.exports = zoom;

let gen = require('./generator.js');

function zoom(storage, callback) {

    let crt_hashkey = gen.crt_hashkey;
    let crt_viewport = gen.crt_viewport;
    let last_viewport = gen.last_viewport;
    let NE_lat = gen.crt_viewport[0];
    let NE_lng = gen.crt_viewport[1];
    let SW_lat = gen.crt_viewport[2];
    let SW_lng = gen.crt_viewport[3];
    if (last_viewport[1]-last_viewport[3] > NE_lng - SW_lng) {              // Zoom in
        let res = gen.cacheInCheck(crt_viewport);
        if (res !== 'NOCACHE') {
            let restab = res.split('|');
            if (restab[0] === 'NO') {                                       // res fit easily in viewport
                //console.log("Zoom in : Res fit easily in viewport!");
                storage.getItem(restab[1], function(err, res) {
                    let split_res = gen.splitPoints(res, crt_viewport);
                    storage.setItem(crt_hashkey, split_res, function() {
                        let hashvalue = ('{"allSnappedPoints":[').concat(split_res);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                });
            } else if (restab[0] === 'YES') {                               // res fit exactly in viewport
                //console.log("Zoom in : Res fit exactly in viewport!");
                storage.getItem(restab[1], function(err, res) {
                    let hashvalue = ('{"allSnappedPoints":[').concat(res);
                    hashvalue = hashvalue.concat(']}');
                    callback(hashvalue);
                });
            }
        } else {
            console.log('An error occured in the storage !');
        }
    } else {                                                                // Zoom out
        let res = gen.cacheInCheck(crt_viewport);
        if (res !== 'NOCACHE') {
            let restab = res.split('|');
            if (restab[0] === 'NO') {                                       // res fit easily in viewport
                //console.log("Zoom out : Res fit easily in viewport!");
                storage.getItem(restab[1], function(err, res) {
                    let split_res = gen.splitPoints(res, crt_viewport);
                    storage.setItem(crt_hashkey, split_res, function() {
                        let hashvalue = ('{"allSnappedPoints":[').concat(split_res);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                });
            } else if (restab[0] === 'YES') {                           // res fit exactly in viewport
                //console.log("Zoom out : Res fit exactly in viewport!");
                storage.getItem(restab[1], function(err, res) {
                    let hashvalue = ('{"allSnappedPoints":[').concat(res);
                    hashvalue = hashvalue.concat(']}');
                    callback(hashvalue);
                });
            }
        } else {                                                       // Some points around the last_viewport hasn't been searched
            //console.log("SOME POINTS HAVE NOT BEEN SEARCHED");
            let points = [];
            let reskey = gen.cacheNearCheck(crt_viewport);
            res = gen.getViewPortFromKey(reskey);
            for (let k = 0; k < 4; k++) {
                let gran_lat, gran_lng;
                let delta_lat, delta_lng;
                let last_lat, last_lng;
                if (k % 2 === 0) {
                    gran_lat = parseInt(Math.abs(crt_viewport[k]-res[k]) * gen.granularity);
                    gran_lng = parseInt(Math.abs(res[1]-res[3]) * gen.granularity);
                    delta_lat = parseFloat(Math.abs(crt_viewport[k]-res[k]) / gran_lat);
                    delta_lng = parseFloat(Math.abs(res[1]-res[3]) / gran_lng);
                } else {
                    gran_lat = parseInt(Math.abs(NE_lat-SW_lat) * gen.granularity);
                    gran_lng = parseInt(Math.abs(crt_viewport[k]-res[k]) * gen.granularity);
                    delta_lat = parseFloat(Math.abs(NE_lat-SW_lat) / gran_lat);
                    delta_lng = parseFloat(Math.abs(crt_viewport[k]-res[k]) / gran_lng);
                }
                switch (k) {                                            // Origin of the generated points grid
                    case 0: last_lat = parseFloat(res[0]); last_lng = parseFloat(res[3]); break;
                    case 1: last_lat = parseFloat(SW_lat); last_lng = parseFloat(res[1]); break;
                    case 2: last_lat = parseFloat(SW_lat); last_lng = parseFloat(res[3]); break;
                    case 3: last_lat = parseFloat(SW_lat); last_lng = parseFloat(SW_lng);
                }
                for (let i = 0; i < gran_lat; i++) {
                    for (let j = 0; j < gran_lng; j++) {
                        let new_lng = last_lng + delta_lng;
                        points.push(new_lng);
                        points.push(last_lat);
                        last_lng = new_lng;
                    }
                    last_lat += delta_lat;
                    switch (k) {
                        case 0: last_lng = parseFloat(res[3]); break;
                        case 1: last_lng = parseFloat(res[1]); break;
                        case 2: last_lng = parseFloat(res[3]); break;
                        case 3: last_lng = parseFloat(SW_lng);
                    }
                }
            }
            storage.getItem(reskey, function(err, res){
                gen.mulReqCaller(points, res, "", callback);
            });
        }
    }
}