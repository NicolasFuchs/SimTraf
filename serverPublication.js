let localtunnel = require('localtunnel');

let port = 3000;
let subdomain = 'simtraf';

function LocalTunnel(port, subdomain) {
    let tunnel = localtunnel(port, {subdomain: subdomain}, function (err, tunnel) {
        if (err) {
            console.log("localTunnelCode Failed with error: " + err);
        } else {
            console.log("localTunnelCode connected and exposed on : " + tunnel.url + ":" + tunnel._opt.port)
        }
    });
    tunnel.on('close', function() {
        console.log("Tunnel closed");
    });
    tunnel.on('error', function(err) {
        console.log("Tunnel error");
        LocalTunnel(port, subdomain);
    });
}

LocalTunnel(port, subdomain);