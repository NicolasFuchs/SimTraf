$(document).ready(function(){
    $('#sub').one('click', function() {
        alert('Button pressed!');
        MashupPlatform.wiring.pushEvent('locationOutput', document.getElementById("loc").value);
    });
});