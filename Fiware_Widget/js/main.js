$(document).ready(function() {
    let stringViewport;
    stringViewport = "((46.533712828772224,6.660933494567871),(46.504359384253085,6.596817970275879))";
    /*MashupPlatform.wiring.registerCallback('viewportInput', function(latlng) {
        stringViewport = latlng;
    });*/
    $('#Menu_Creation').click(function() {
        $('#Menu').hide(); $('#Creation').show();
    });
    $('#Menu_Choice').click(function() {
        $('#Menu').hide(); $('#Choice').show();
        /*MashupPlatform.http.makeRequest('https://simtraf.localtunnel.me/choice', {
            method: "GET",
            contentType: "text/plain",
            responseType: "text",
            onSuccess: function (res) {
                if (res !== "") {
                    let choices = JSON.parse(res).scenarios;
                    for (let i = 0; i < choices.length; i++) {
                        $('#createdList').append('<tr><td>' + choices[i].name + '</td><td>' + choices[i].scenario + '</td><td>' + choices[i].location + '</td></tr>');
                    }
                }
            },
            onFailure: function (res) {
                alert('Something went wrong!' + res.response);
            }
        });*/

    });
    $('#Creation_Choice').click(function() {
        $('#Creation').hide();
        let viewport = decodeStringViewport(stringViewport);
        MashupPlatform.http.makeRequest('https://simtraf.localtunnel.me/creation', {
            method: "GET",
            contentType: "text/plain",
            responseType: "text",
            parameters: {name: $('#s_name').val(), location: $('#s_loc').val(), NE_lat: viewport[0], NE_lng: viewport[1], SW_lat: viewport[2], SW_lng: viewport[3], type: scena},
            onSuccess: function (res) {
                //alert('res.response : ' + res.response);
                /*$.get('https://simtraf.localtunnel.me/choice', function (res) {
                    if (res !== "") {
                        let choices = JSON.parse(res).scenarios;
                        for (let i = 0; i < choices.length; i++) {
                            $('#createdList').append('<tr><td>' + choices[i].name + '</td><td>' + choices[i].scenario + '</td><td>' + choices[i].location + '</td></tr>');
                        }
                    }
                    $('#Choice').show();
                });*/
                MashupPlatform.http.makeRequest('https://simtraf.localtunnel.me/creation', {
                    method: "GET",
                    contentType: "text/plain",
                    responseType: "text",
                    onSuccess: function (res) {
                        if (res !== "") {
                            let choices = JSON.parse(res).scenarios;
                            for (let i = 0; i < choices.length; i++) {
                                $('#createdList').append('<tr><td>' + choices[i].name + '</td><td>' + choices[i].scenario + '</td><td>' + choices[i].location + '</td></tr>');
                            }
                        }
                        $('#Choice').show();
                    },
                    onFailure: function (res) {
                        alert('Something went wrong!' + res.response);
                    }
                });
            },
            onFailure: function (res) {
                alert('Something went wrong!' + res.response);
            }
        });
        /*$.get('https://simtraf.localtunnel.me/creation',    {   name: $('#s_name').val(),
                                                                location: $('#s_loc').val(),
                                                                type: scena,
                                                                NE_lat: viewport[0],
                                                                NE_lng: viewport[1],
                                                                SW_lat: viewport[2],
                                                                SW_lng: viewport[3]
                                                            }, function (res) {
            $('#createdList').append('<tr><td>' + $('#s_name').val() + '</td><td>' + scena + '</td><td>' + $('#s_loc').val() + '</td></tr>');
            $('#Choice').show();
            alert(res);
        });*/
    });
    $('#Choice_Run').click(function() {
        $('#Choice').hide(); $('#Run').show();
    });
    $('#Run_Menu').click(function() {
        $('#Run').hide(); $('#Menu').show();
    });

    $('#s_loc').focusout(function() {
        if ($('#s_loc').val() !== "") {
            //MashupPlatform.wiring.pushEvent('locationOutput', $('#s_loc').val());
        }
    });

    let scena;
    $('#scenarios *').click(function() {
        $('#scenarios *').css('background-color','');
        $(this).css('background-color','grey');
        $(this).css('outline','black');
        scena = $(this).text();
    });

});

function decodeStringViewport(stringViewport) {
    let number = "";
    let viewport = [];
    for (let i = 0; i < stringViewport.length; i++) {
        let char = stringViewport[i];
        if (!isNaN(char) || char === '.') {
            number = number + char;
        } else if (char === ',' || char === ')') {
            if (number !== "") viewport.push(parseFloat(number));
            number = "";
        }
    }
    return viewport;
}