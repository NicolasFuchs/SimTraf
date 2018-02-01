$(document).ready(function() {
    MashupPlatform.wiring.registerCallback('timestampInput', function (value) {
        $('#slider').val(value);
        $('#slider').slider('refresh');
    });
    $('#slider').mouseup(function() {
        MashupPlatform.wiring.pushEvent('timestampOutput', $('#slider').slider('value'));
    });
});