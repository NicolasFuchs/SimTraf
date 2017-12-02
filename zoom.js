module.exports = zoom;

let gen = require('./generator.js');

function zoom(storage, callback) {
    let crt_hashkey = gen.crt_hashkey;
    let crt_viewport = gen.crt_viewport;
    let last_viewport = gen.last_viewport;
    if (last_viewport[1]-last_viewport[3] > crt_viewport[1] - crt_viewport[3]) {    // Zoom in
        let res = gen.cacheInCheck(crt_viewport);
        if (res !== 'NOCACHE') {
            let restab = res.split('|');
            if (restab[0] === 'NO') {                                               // res fit easily in viewport
                storage.getItem(restab[1], function(err, res) {
                    let split_res = gen.splitPoints(res, crt_viewport);
                    storage.setItem(crt_hashkey, split_res, function() {
                        let hashvalue = ('{"allSnappedPoints":[').concat(split_res);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                });
            } else if (restab[0] === 'YES') {                                       // res fit exactly in viewport
                storage.getItem(restab[1], function(err, res) {
                    let hashvalue = ('{"allSnappedPoints":[').concat(res);
                    hashvalue = hashvalue.concat(']}');
                    callback(hashvalue);
                });
            }
        } else {
            console.log('An error occured in the storage !');
        }
    } else {                                                                        // Zoom out
        let res = gen.cacheInCheck(crt_viewport);
        if (res !== 'NOCACHE') {
            let restab = res.split('|');
            if (restab[0] === 'NO') {                                               // res fit easily in viewport
                storage.getItem(restab[1], function(err, res) {
                    let split_res = gen.splitPoints(res, crt_viewport);
                    storage.setItem(crt_hashkey, split_res, function() {
                        let hashvalue = ('{"allSnappedPoints":[').concat(split_res);
                        hashvalue = hashvalue.concat(']}');
                        callback(hashvalue);
                    });
                });
            } else if (restab[0] === 'YES') {                                       // res fit exactly in viewport
                storage.getItem(restab[1], function(err, res) {
                    let hashvalue = ('{"allSnappedPoints":[').concat(res);
                    hashvalue = hashvalue.concat(']}');
                    callback(hashvalue);
                });
            }
        } else {                                                                    // Some points around the last_viewport hasn't been searched
            let cacheNear = gen.cacheNearCheck(crt_viewport);
            let reskey = cacheNear[0];
            let rectangles = cacheNear[1];
            let points = gen.pointsFromRectangles(rectangles);
            storage.getItem(reskey, function(err, res){
                gen.mulReqCaller(points, res, "", callback);
            });
        }
    }
}