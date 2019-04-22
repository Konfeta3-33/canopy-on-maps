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
        var data = readData();
        document.getElementById('day').textContent = data.date;
        document.getElementById('percent').textContent = data.percent;
        console.log(data.percent);
    } catch (err) {
        alert('Нам не удалось прочитать сообщение');
    }

    if (window.myCoordinates) {
        var bounds = new google.maps.LatLngBounds();

        bounds.extend(window.myCoordinates);
        bounds.extend(data.coordinates);
        map.fitBounds(bounds);
    } else {
        map.setCenter(data.coordinates);
    }

    new google.maps.Marker({
        position: data.coordinates,
        map: map
    });

    document.querySelector('.gps-input').classList.add('hide');
    document.querySelector('.gps-result').classList.remove('hide');
    // document.querySelector('.battery').classList.remove('hide');
    document.querySelector('#day').classList.remove('hide');
    document.querySelector('#percent').classList.remove('hide');
    document.querySelector('i#threeDot').classList.add('hide');
    document.querySelector('i#threeDotBat').classList.add('hide');
}

function handleEdit() {
    document.querySelector('.gps-result').classList.add('hide');
    document.querySelector('.gps-input').classList.remove('hide');
    // document.querySelector('.battery').classList.add('hide');
    document.querySelector('#day').classList.add('hide');
    document.querySelector('#percent').classList.add('hide');
    document.querySelector('i#threeDot').classList.remove('hide');
    document.querySelector('i#threeDotBat').classList.remove('hide');
}

function handleCopy() {
    var textArea = document.querySelector('.coordinates');
    var range = document.createRange();

    range.selectNode(textArea);
    window.getSelection().addRange(range);

    document.execCommand('copy');
}

function readData() {
    var input = document.getElementById('input').value;

    return {
        date: parseDate(input),
        coordinates: parseCoordinates(input),
        percent: parseBattery(input)
    };
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
// $GPRMC,080408.000,A,5447.2126,N,03738.6508,E,7.78,13.21,310319,,,A* 00,00; GSM: 250-01 026c-ffce,ffcd,1ced,ffff, 42;  S; Batt: 361,M
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

function parseDate(str) {
    var nmea = str.split(',');

    var timePart = nmea[1];
    var hour = timePart.substring(0, 2);
    var minut = timePart.substring(2, 4);
    var sec = timePart.substring(4,6);
    var time = hour + ':' + minut + ':' + sec;

    var datePart = nmea[9];
    var year = datePart.substring(4, 6);
    var month = datePart.substring(2, 4);
    var day = datePart.substring(0, 2);
    var date = '20' + year + '-' + month + '-' + day;

    return date + ' ' + time;
}

function parseBattery(str) {
    var nmea = str.split(';');

    var batteryPart = nmea[3];
    var power = parseInt(batteryPart.substring(7, 10));
    var percent = '';

    if (power > 375) {
        percent = '100%';
    } else if (power < 340) {
        percent = '< 10%';
    } else {
        percent = 90 * ((power - 340)/(375 - 340)) + '%';
    }

    // if (power >= 340 && power <= 375) {
    //     percent = 
    // }

    console.log(percent);
    return percent;
}