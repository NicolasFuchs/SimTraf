module.exports.selector = selector;

let gen = require('./generator.js');

let VEHICLE_TYPES = ["Car","Motorcycle"/*,"Bus","Van","Motorscooter","AgriculturalVehicle"*/];
let CAR_BRANDS = ["BMW","Mercedes-Benz","VW","Ferrari","Corvette","Maserati","Audi"];
let MOTORCYCLE_BRANDS = ["Ducati","Honda","BMW","Kawasaki","Aprilia","Suzuki","Harley-Davidson"];
let PLATE_REGIONS = ["VD","GE","FR","NE","BE","VS","ZH","BS"];

function selector(points, scenario, callback) {
    let viewport = gen.crt_viewport;
    let jsonPoints = JSON.parse(points);
    let nbP = numberPoints(jsonPoints);
    let cp = [];
    let chosenPoints = [];
    let nbPtc;  // Number of Points to choose
    let random;
    switch(scenario) {
        case "cut" : // car_usual_traffic
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, true);
            break;
        case "aut" : // all_usual_traffic
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "act" : // all_congested_traffic
            nbPtc = Math.floor((Math.random()*(1/100)*nbP)+(9/100)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "aup" : // all_usual_parking
            nbPtc = Math.floor((Math.random()*(9/5000)*nbP)+(1/5000)*nbP);
            cp = choosePoints(jsonPoints, nbPtc);
            chosenPoints = buildJSON(cp, false);
            break;
        case "cmt" : // car_min_timing
            let pob = pointsOnBorder(jsonPoints, viewport);
            let npob = pob.length/2;
            nbPtc = (npob < 10)?npob:10;
            for (let i = 0; i < nbPtc; i++) {
                do {
                    random = Math.floor(Math.random()*npob)*2;
                } while(isNaN(pob[random]));
                chosenPoints.push(pob[random+1]);
                chosenPoints.push(pob[random]);
                pob[random] = NaN;
            }
            chosenPoints = buildJSON(chosenPoints, true);
    }
    console.log(chosenPoints);
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

function buildJSON(chosenPoints, onlyCars) {
    let vehicles = '{"allSnappedPoints":[{"snappedPoints":[';
    for (let i = 0; i < chosenPoints.length; i++) {
        if (i !== 0) {
            vehicles = vehicles.concat(',');
        }
        vehicles = vehicles.concat('{"timestamp":"');
        vehicles = vehicles.concat(Date.now().toString());
        vehicles = vehicles.concat('",');
        vehicles = vehicles.concat('"vehiclePlateIdentifier":"');
        vehicles = vehicles.concat(randomPlate());
        vehicles = vehicles.concat('",');
        vehicles = vehicles.concat('"vehicleType":');
        let isCar = Math.random();
        vehicles = vehicles.concat((onlyCars || isCar >= 0.5)?'"Car",':'"Motorcycle",');
        vehicles = vehicles.concat('"brandName":"');
        vehicles = vehicles.concat((onlyCars || isCar >= 0.5)?randomBrandName(true):randomBrandName(false));
        vehicles = vehicles.concat('",');
        vehicles = vehicles.concat('"color":"');
        vehicles = vehicles.concat(randomColor());
        vehicles = vehicles.concat('",');
        vehicles = vehicles.concat('"location":{');
        vehicles = vehicles.concat('"latitude":');
        vehicles = vehicles.concat(chosenPoints[i++]);
        vehicles = vehicles.concat(',');
        vehicles = vehicles.concat('"longitude":');
        vehicles = vehicles.concat(chosenPoints[i]);
        vehicles = vehicles.concat('}}');
    }
    vehicles = vehicles.concat(']}]}');
    return vehicles;
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
            np += points.allSnappedPoints[i].snappedPoints.length;
        }
    }
    return np;
}

// Returns an array containing all points on and around the border of the viewport
function pointsOnBorder(points, viewport) {
    let pob = [];
    let margin = 0.0005;
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