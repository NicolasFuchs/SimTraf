module.exports = drag;

let gen = require('./generator.js');

function drag(storage, callback) {
    let crt_hashkey = gen.crt_hashkey;
    let crt_viewport = gen.crt_viewport;
    let res = gen.cacheInCheck(crt_viewport);
    if (res !== 'NOCACHE') {
        let restab = res.split('|');
        if (restab[0] === 'NO') {                                               // res fit easily in viewport
            storage.getItem(restab[1], function(err, res) {
                let split_res = gen.splitPoints(res, crt_viewport);
                storage.setItem(crt_hashkey, split_res, function() {
                    let hashvalue = ('{"allSnappedPoints":[').concat(split_res);
                    hashvalue = hashvalue.concat(']}');
                    gen.last_viewport = crt_viewport;
                    callback(hashvalue);
                });
            });
        } else if (restab[0] === 'YES') {                                       // res fit exactly in viewport
            storage.getItem(restab[1], function(err, res) {
                let hashvalue = ('{"allSnappedPoints":[').concat(res);
                hashvalue = hashvalue.concat(']}');
                gen.last_viewport = crt_viewport;
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