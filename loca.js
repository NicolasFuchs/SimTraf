module.exports = loca;

let gen = require('./generator.js');

function loca(storage, callback) {
    let points = [];
    //let granularity = 100;
    let NE_lat = gen.crt_viewport[0];
    let NE_lng = gen.crt_viewport[1];
    let SW_lat = gen.crt_viewport[2];
    let SW_lng = gen.crt_viewport[3];

    let gran_lat = parseInt(Math.abs(NE_lat-SW_lat) * gen.granularity);
    let gran_lng = parseInt(Math.abs(NE_lng-SW_lng) * gen.granularity);
    let delta_lat = parseFloat(Math.abs(NE_lat-SW_lat) / gran_lat);
    let delta_lng = parseFloat(Math.abs(NE_lng-SW_lng) / gran_lng);

    let last_lat = SW_lat;                              // Used in loops
    let last_lng = SW_lng;                              // Used in loops
    let new_lng;                                        // Used in loops

    storage.getItem(gen.crt_hashkey, function(err, res) {
        if (res) {
            gen.last_hashkey = gen.crt_hashkey;
            gen.last_viewport = gen.crt_viewport;
            res = ('{"allSnappedPoints":[').concat(res);
            res = res.concat(']}');
            callback(res);
        } else {
            for (let i = 0; i < gran_lat; i++) {        // Generation of points on a grid
                for (let j = 0; j < gran_lng; j++) {
                    new_lng = last_lng + delta_lng;
                    points.push(new_lng);
                    points.push(last_lat);
                    last_lng = new_lng;
                }
                last_lat += delta_lat;
                last_lng = SW_lng;
            }
            gen.mulReqCaller(points, "", "", callback); // Call of the nearest roads function (google API)
        }
    });
}