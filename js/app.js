window.addEventListener('DOMContentLoaded', function() {
    initMap();
    addMyPosition();

    document.getElementById('btn-save').addEventListener('click', handleSave);
    document.getElementById('btn-edit').addEventListener('click', handleEdit);
    document.getElementById('btn-copy').addEventListener('click', handleCopy);
});

function initMap() {
    var element = document.getElementById('map');
    element.map = new google.maps.Map(element, {
        center: {lat: 55.781031, lng: 37.623968},
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
    });
}

function handleSave() {
    var map = document.getElementById('map').map;
    try {
        var coordinates = readCoordinates();
    } catch (err) {
            alert('Нам не удалось прочитать сообщение')
        }

    if (window.myCoordinates) {
        var bounds = new google.maps.LatLngBounds();

        bounds.extend(window.myCoordinates);
        bounds.extend(coordinates);
        map.fitBounds(bounds);
    } else {
        map.setCenter(coordinates);
        alert('Введите корректные данные');
    }

    new google.maps.Marker({
        position: coordinates,
        map: map
    });

    document.querySelector('.gps-input').classList.add('hide');
    document.querySelector('.gps-result').classList.remove('hide');
}

function handleEdit() {
    document.querySelector('.gps-result').classList.add('hide');
    document.querySelector('.gps-input').classList.remove('hide');
}

function handleCopy() {
    var textArea = document.querySelector('.coordinates');
    var range = document.createRange();

    range.selectNode(textArea);
    window.getSelection().addRange(range);

    document.execCommand('copy');
}

function readCoordinates() {
    var input = document.getElementById('input').value;

    return parseCoordinates(input);
}

function addMyPosition(){
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position) {
    var latitude = position.coords.latitude,
        longitude = position.coords.longitude;
    var map = document.getElementById('map').map;

    window.myCoordinates = { lat: latitude, lng: longitude };

    map.setCenter(window.myCoordinates);

    new google.maps.Marker({
        position: window.myCoordinates,
        map: map
    });
}

// DATA FORMAT
//
// RMC - NMEA has its own version of essential gps pvt (position, velocity, time) data. It is called RMC, The Recommended Minimum, which will look similar to:
//
// $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A
//
// Where:
//      RMC          Recommended Minimum sentence C
//      123519       Fix taken at 12:35:19 UTC
//      A            Status A=active or V=Void.
//      4807.038,N   Latitude 48 deg 07.038' N
//      01131.000,E  Longitude 11 deg 31.000' E
//      022.4        Speed over the ground in knots
//      084.4        Track angle in degrees True
//      230394       Date - 23rd of March 1994
//      003.1,W      Magnetic Variation
//      *6A          The checksum data, always begins with *
function parseCoordinates(str) {
    var nmea = str.split(',');

    function parseLatitude() {
        var degrees = Number(nmea[3].substring(0, 2));
        var seconds = Number(nmea[3].substring(2));
        var negate = nmea[4].toUpperCase() === 'S';
        return (degrees + seconds / 60) * (negate ? -1 : 1);
    }

    function parseLongitude() {
        var degrees = Number(nmea[5].substring(0, 3));
        var seconds = Number(nmea[5].substring(3));
        return degrees + seconds / 60;
    }

    return { lat: parseLatitude(), lng: parseLongitude() };
}