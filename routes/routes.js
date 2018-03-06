//App routes
module.exports = function (app) {

    var utilities = require('../app/controllers/utilities');
    var camaras = require('../app/controllers/camaras');
    var passport = require('passport');

    /* Home Page */
    app.get('/', utilities.index);

    // Camaras (vistas)
    app.get('/live', camaras.index); // index de todas las cámaras en directo
    app.get('/listcamaras', camaras.listindex); // vista para añadir camara
    app.get('/historial', camaras.historialindex); // Historial de conexiones
    app.get('/status', camaras.estadoindex); // vista para añadir camara
    app.get('/incidencias', camaras.incidenciasindex); // Incidencias
    app.get('/mapa', camaras.mapaindex); // Mapa
    app.get('/contacto', camaras.contactindex); // Contacto
    app.get('/emailenviado', camaras.emailsent); // Email enviado satisfactoriamente
    app.get('/emailerror', camaras.emailerror); // Fallo al enviar el email

    // API
    app.post('/camara', camaras.new); // crear nueva camara --> registro
    app.delete('/camara/:id', camaras.delete); // Borra cámara registrada

    app.get('/gethistorial', camaras.getHistorial); // Obtiene el historial de la bbdd
    app.delete('/deletehistorial', camaras.deleteHistorial); // Borrar historial

    app.get('/camaras', camaras.getall); // json con todas las camaras del servidor
    app.get('/livecameras', camaras.getalllive); // json con todas las camaras onlive del servidor

    app.get('/online/:id', camaras.getisonline); // poner una cámara onLive
    app.put('/online/:name', camaras.putonline); // poner una cámara onLive
    app.put('/offline/:name', camaras.putoffline); // poner una cámara offLive

    app.get('/getEstado',  camaras.getEstado); // Obtiene el estado de los dispositivos de los usuarios
    app.put('/statusdevice/:mac', camaras.updateStateDevice); // actualizar el estado de los dispositivos
    app.delete('/deletestatusdevice/:id', camaras.deleteStatusDevice); // Borra info del estado para una víctima

    app.get('/getIncidencias',  camaras.getIncidencias); // Obtiene todas las incidencias
    app.delete('/incidencia/:id', camaras.deleteIncidencias); // Borra cámara registrada
    app.put('/newincidence/:mac', camaras.addNewIncidence); // Añade nueva incidencia para un usuario
    app.post('/updateincidences', camaras.updateIncidences); // Comprueba si hay que generar nuevas incidencias

    app.get('/allstatusdevice', camaras.getallstatusdevice); // json con todas las camaras y sus estados del servidor
    app.get('/updatemarkers/:id', camaras.updatemarkers); // poner una cámara onLive

    app.put('/updateaggressorposition/:victim_mac', camaras.updateAggressorPosition); // Actualiza la posición GPS del agresor

    app.post('/contactemail', camaras.contactEmail); // Envía un correo cuando se pulsa el botón de "Enviar"
}
