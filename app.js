// Variables de configuración
const CLIENT_ID = '983205639998-f3u9akdta6s0iek8h1nglgbajqvdjrev.apps.googleusercontent.com';
const API_KEY = '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';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_ID = 'AKfycbxvrX1V_TNnxRw7duNekdNnsUpbd4dDWAVPmFlMZuWwmjMQYvzVPdAWkmwoi5xvUktSgg';
const RANGE = 'Sheet1!A1:D1';  // Aquí defines el rango donde deseas insertar los datos

let gapiInited = false;
let gisInited = false;

// Inicializar la API de Google
function gapiLoad() {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4').then(function () {
        gapiInited = true;
        maybeEnableButtons();
    });
}

// Inicializar la autenticación de Google
function gisLoad() {
    gapi.load('auth2', function () {
        gapi.auth2.init({ client_id: CLIENT_ID }).then(function () {
            gisInited = true;
            maybeEnableButtons();
        });
    });
}

// Función para manejar errores en la carga de la API
function handleApiLoadError() {
    alert('Hubo un error al cargar la API de Google.');
}

// Verifica si ambas APIs están listas para su uso
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        authenticate();
    }
}

// Función de autenticación de Google
function authenticate() {
    gapi.auth2.getAuthInstance().signIn().then(function () {
        console.log("Autenticación exitosa");
        obtenerUbicacion();
    });
}

// Función para enviar la ubicación a Google Sheets
function enviarUbicacion(lat, lng, accuracy) {
    const values = [
        [new Date().toLocaleString(), lat, lng, accuracy]
    ];

    const body = {
        values: values
    };

    const request = gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: body
    });

    request.then(function (response) {
        console.log('Ubicación guardada: ', response);
        document.getElementById('output').textContent = 'Ubicación enviada correctamente.';
    }, function (reason) {
        console.error('Error al guardar la ubicación: ', reason);
        document.getElementById('output').textContent = 'Error al enviar: ' + reason.result.error.message;
    });
}

// Función para obtener la ubicación del usuario
function obtenerUbicacion() {
    if (!navigator.geolocation) {
        document.getElementById('output').textContent = 'Geolocalización no soportada.';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude, accuracy } = pos.coords;
            enviarUbicacion(latitude, longitude, accuracy);
        },
        err => {
            document.getElementById('output').textContent = 'Error: ' + err.message;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Esperar a que la página se cargue completamente
window.onload = function () {
    gapi.load('client:auth2', gapiLoad);  // Cargar la API de Google cuando la página se cargue
    gisLoad();  // Inicializar la autenticación
};
