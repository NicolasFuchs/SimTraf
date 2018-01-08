$(document).ready(function(){
    $('#connect').click(function() {
        MashupPlatform.http.makeRequest('https://simtraf.localtunnel.me/tunnel', {
            method: "GET",
            contentType: "text/plain",
            responseType: "text",
            onSuccess: function (res) {
                alert('res.response : ' + res.response);
                MashupPlatform.wiring.pushEvent('locationOutput', res.response);
            },
            onFailure: function (response) {
                alert('Something went wrong!');
            }
        });
    });
});