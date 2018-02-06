module.exports.selector = selector;

let gen = require('./generator.js');

let CAR_BRANDS = ["BMW","Mercedes-Benz","VW","Ferrari","Corvette","Maserati","Audi"];
let MOTORCYCLE_BRANDS = ["Ducati","Honda","BMW","Kawasaki","Aprilia","Suzuki","Harley-Davidson"];
let PLATE_REGIONS = ["VD","GE","FR","NE","BE","VS","ZH","BS"];

function selector(points, scenario_type, scenario_name, callback) {
    let viewport = gen.crt_viewport;
    let jsonPoints = JSON.parse(points);
    let nbP = numberPoints(jsonPoints);
    let cp = [];
    let chosenPoints = [];
    let nbPtc;  // Number of Points to choose
    let random;
    switch(scenario_type) {
        case "car usual transit" :
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, true);
            break;
        case "all usual transit" :
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "all congested transit" :
            nbPtc = Math.floor((Math.random()*(1/100)*nbP)+(9/100)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "all usual parking" :
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "car minimal timing" :
            let pob = pointsOnBorder(jsonPoints, viewport);
            let npob = pob.length/2;
            nbPtc = (npob < 10)?npob:10;
            nbPtc = 2;
            for (let i = 0; i < nbPtc; i++) {
                do {
                    random = Math.floor(Math.random()*npob)*2;
                } while(isNaN(pob[random]));
                chosenPoints.push(pob[random+1]);
                chosenPoints.push(pob[random]);
                pob[random] = NaN;
            }
            chosenPoints = buildJSON(chosenPoints, scenario_name, true);
    }
    callback(chosenPoints);
}

function choosePoints(jsonPoints, nbPtc) {
    let cp = [];
    let alreadyChosen = [];
    while (0 < nbPtc--) {
        let lat;
        let lng;
        do {
            let randomI = Math.floor(Math.random() * jsonPoints.allSnappedPoints.length);
            let randomJ = Math.floor(Math.random() * jsonPoints.allSnappedPoints[randomI].snappedPoints.length);
            lat = jsonPoints.allSnappedPoints[randomI].snappedPoints[randomJ].location.latitude;
            lng = jsonPoints.allSnappedPoints[randomI].snappedPoints[randomJ].location.longitude;
        } while (alreadyChosen.indexOf([lat,lng]) !== -1);
        cp.push(lat);
        cp.push(lng);
        alreadyChosen.push([lat,lng]);
    }
    return cp;
}

function buildJSON(chosenPoints, scenario_name, onlyCars) {
    let vehicles = '{"contextElements":[';
    let date = new Date().toISOString();
    for (let i = 0; i < chosenPoints.length; i++) {
        if (i !== 0) {
            vehicles = vehicles.concat(',');
        }
        vehicles = vehicles.concat('{"type":"Vehicle","isPattern":"false","id":"');
        vehicles = vehicles.concat(randomId());
        vehicles = vehicles.concat('","attributes":[');
        vehicles = vehicles.concat('{"name":"vehiclePlateIdentifier","type":"string","value":"');
        vehicles = vehicles.concat(randomPlate());
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"vehicleType","type":"string","value":"');
        vehicles = vehicles.concat((onlyCars || Math.random() >= 0.5)?'Car':'Motorcycle');
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"brandName","type":"string","value":"');
        vehicles = vehicles.concat((onlyCars || Math.random() >= 0.5)?randomBrandName(true):randomBrandName(false));
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"color","type":"string","value":"');
        vehicles = vehicles.concat(randomColor());
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"location","type":"geo:point","value":"');
        vehicles = vehicles.concat(chosenPoints[i++]);
        vehicles = vehicles.concat(',');
        vehicles = vehicles.concat(chosenPoints[i]);
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"timestamp","type":"Date","value":"');
        vehicles = vehicles.concat(date);
        vehicles = vehicles.concat('"},');
        vehicles = vehicles.concat('{"name":"scenario","type":"string","value":"');
        vehicles = vehicles.concat(scenario_name);
        vehicles = vehicles.concat('"}]}');
    }
    vehicles = vehicles.concat('],"updateAction": "APPEND"}');
    return vehicles;
}

function randomId() {
    return "Vehicle" + Math.floor(Math.random()*1000000);
}

function randomPlate() {
    let plate = PLATE_REGIONS[Math.floor(Math.random()*PLATE_REGIONS.length)];
    plate += (Math.floor(Math.random()*1000000));
    return plate;
}

function randomBrandName(isCar) {
    let brandName;
    if (isCar) {
        brandName = CAR_BRANDS[Math.floor(Math.random()*CAR_BRANDS.length)];
    } else {
        brandName = MOTORCYCLE_BRANDS[Math.floor(Math.random()*MOTORCYCLE_BRANDS.length)];
    }
    return brandName;
}

function randomColor() {
    let CHARACTERS = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color = color.concat(CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)]);
    }
    return color;
}

function numberPoints(points) {
    let np = 0;
    for (let i = 0; i < points.allSnappedPoints.length; i++) {
        for (let j = 0; j < points.allSnappedPoints[i].snappedPoints.length; j++) {
            if (points.allSnappedPoints[i].snappedPoints !== "{}") {
                np += points.allSnappedPoints[i].snappedPoints.length;
            }
        }
    }
    return np;
}

// Returns an array containing all points on and around the border of the viewport
function pointsOnBorder(points, viewport) {
    let pob = [];
    let margin = (viewport[0]-viewport[2])/50;
    for (let i = 0; i < points.allSnappedPoints.length; i++) {
        for (let j = 0; j < points.allSnappedPoints[i].snappedPoints.length; j++) {
            let point = points.allSnappedPoints[i].snappedPoints[j];
            let ptLat = point.location.latitude;
            let ptLng = point.location.longitude;
            for (let k = 0; k < 4; k++) {
                if (k % 2 === 0) {  // On sides 0 and 2 of the viewport
                    if (ptLng >= viewport[3] && ptLng <= viewport[1]) {
                        if (k === 0 && ptLat >= viewport[k]-margin && ptLat <= viewport[k] || k === 2 && ptLat >= viewport[k] && ptLat <= viewport[k]+margin) {
                            pob.push(ptLng);
                            pob.push(ptLat);
                            break;
                        }
                    }
                } else {            // On sides 1 and 3 ot the viewport
                    if (ptLat >= viewport[2] && ptLat <= viewport[0]) {
                        if (k === 1 && ptLng >= viewport[k]-margin && ptLng <= viewport[k] || k === 3 && ptLng >= viewport[k] && ptLng <= viewport[k]+margin) {
                            pob.push(ptLng);
                            pob.push(ptLat);
                            break;
                        }
                    }
                }
            }
        }
    }
    return pob;
}