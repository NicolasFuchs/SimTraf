module.exports.creator = creator;
module.exports.choice = choice;

let storage = require('node-persist');
storage.initSync({
    dir: '../persist',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    continuous: true,
    ttl: false
});

function creator(scenario_name, scenario_location, scenario_type, callback) {
    storage.getItem('scenarios', function(err, res) {
        if (res !== undefined) {
            let scenas = res;
            scenas.scenarios.push({"name": scenario_name,"scenario": scenario_type,"location": scenario_location});
            storage.setItemSync('scenarios', scenas);
        } else {
            storage.setItemSync('scenarios', {"scenarios":[{"name": scenario_name,"scenario": scenario_type,"location": scenario_location}]});
        }
        callback();
    });
}

function choice(callback) {
    storage.getItem('scenarios', function(err, res) {
        if (res === undefined) res = "";
        callback(JSON.stringify(res));
    });
}