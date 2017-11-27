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