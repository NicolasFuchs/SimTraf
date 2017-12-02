module.exports = loca;

let gen = require('./generator.js');

function loca(storage, callback) {
    let crt_viewport = gen.crt_viewport;
    let rectangle = [[crt_viewport[0], crt_viewport[1], crt_viewport[2], crt_viewport[3]]];

    storage.getItem(gen.crt_hashkey, function(err, res) {
        if (res) {
            res = ('{"allSnappedPoints":[').concat(res);
            res = res.concat(']}');
            callback(res);
        } else {
            let points = gen.pointsFromRectangles(rectangle);
            gen.mulReqCaller(points, "", "", callback); // Call of the nearest roads function (google API)
        }
    });
}