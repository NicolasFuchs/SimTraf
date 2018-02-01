let scenarioToRun;
let scenarioType;
let locationName;
let stopSimulation = false;
$(document).ready(function() {
    let stringViewport = "";
    let timestamp;
    MashupPlatform.wiring.registerCallback('viewportInput', function(latlng) {
        stringViewport = latlng;
    });
    MashupPlatform.wiring.registerCallback('sliderInput', function(time) {
        timestamp = time;
    });
    $('#Menu_Creation').click(function() {
        $('#Menu').hide(); $('#Creation').show();
    });
    $('#Menu_Choice').click(function() {
        $('#Menu').hide();
        MashupPlatform.http.makeRequest('http://simtraf.pagekite.me/grid', {
        method: "GET",
            contentType: "text/plain",
            responseType: "text",
            onSuccess: function (res) {
                displayGrid(res);
            },
            onFailure: function (res) {
                alert('Something went wrong!' + res.response);
            }
        });

    });
    $('#Creation_Choice').click(function() {
        $('#Creation').hide();
        let viewport = decodeStringViewport(stringViewport);
        MashupPlatform.http.makeRequest('http://simtraf.pagekite.me/creation', {
            method: "GET",
            contentType: "text/plain",
            responseType: "text",
            parameters: {name: $('#s_name').val(), location: $('#s_loc').val(), NE_lat: viewport[2], NE_lng: viewport[3], SW_lat: viewport[0], SW_lng: viewport[1], type: scena},
            onSuccess: function (res) {
                            displayGrid(res);
                        },
            onFailure: function (res) {
                alert('Something went wrong!' + res.response);
            }
        });
    });
    let entities;
    $('#Choice_Run').click(function() {
        stopSimulation = false;
        $('#Choice').hide(); $('#Run').show();
        $("#runningScenario tr").remove();
        $('#runningScenario').find('tbody').append('<tr><th>Scenario name</th><th>Scenario type</th><th>Location</th></tr>');
        $('#runningScenario').find('tbody').append('<tr><td>' + scenarioToRun + '</td><td>' + scenarioType + '</td><td>' + locationName + '</td></tr>');
        MashupPlatform.wiring.pushEvent('locationOutput', locationName);
        MashupPlatform.http.makeRequest('http://simtraf.pagekite.me/choice', {
            method: "GET",
            contentType: "text/plain",
            responseType: "json",
            parameters: {name: scenarioToRun},
            onSuccess: function (res) {
                entities = res.response;
                if (res !== "") {
                    for (let i = 0; i < res.response.length; i++) {
                        MashupPlatform.wiring.pushEvent('entityOutput', JSON.stringify(res.response[i][0]));
                    }
                    runSimulation(entities, 1);
                }
            },
            onFailure: function (res) {
                alert('Something went wrong!' + res.response);
            }
        });
    });
    $('#Run_Menu').click(function() {
        stopSimulation = true;
        $('#Run').hide(); $('#Menu').show();
    });

    $('#s_loc').focusout(function() {
        if ($('#s_loc').val() !== "") {
            MashupPlatform.wiring.pushEvent('locationOutput', $('#s_loc').val());
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

let entityToDelete = [];
function runSimulation(entities, index) {
    if (index < entities[0].length) {
        entityToDelete = [];
        for (let i = 0; i < entities.length; i++) {
            MashupPlatform.wiring.pushEvent('entityOutput', JSON.stringify(entities[i][index]));
            entityToDelete.push(entities[i][index]);
        }
        if (!stopSimulation) {
            setTimeout(function() { runSimulation(entities, index+1); }, 2000);
        } else {
            for (let j = 0; j < entityToDelete.length; j++) {
                MashupPlatform.wiring.pushEvent('deleteOutput', JSON.stringify(entityToDelete[j]));
            }
        }
    }
}

function displayGrid(grid) {
    if (grid !== "") {
        let choices = JSON.parse(grid.response).scenarios;
        $("#createdList tr").remove();
        $('#createdList').find('tbody').append('<tr><th>Scenario name</th><th>Scenario type</th><th>Location</th></tr>');
        while (choices.length > 0) {
            let last = choices.pop();
            $('#createdList').find('tbody').append('<tr><td>' + last.name + '</td><td>' + last.scenario + '</td><td>' + last.location + '</td></tr>');
        }
        $("#createdList tr").on('click', function(){
            let selectedScena = $(this).find('td:first').html();
            scenarioType = $(this).find('td:nth-child(2)').html();
            locationName = $(this).find('td:last').html();
            scenarioToRun = undefined;
            if (selectedScena !== undefined) {
                scenarioToRun = selectedScena;
                $("#createdList tr").css('background', 'white');
                $(this).css('background', 'green');
            }
        });
    }
    $('#Choice').show();
}

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