//App routes
module.exports = function (app) {

    var user = require('../app/controllers/user');
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

    app.get('/getIncidencias',  camaras.getIncidencias); // Obtiene todas las incidencias
    app.delete('/incidencia/:id', camaras.deleteIncidencias); // Borra cámara registrada
    app.put('/newincidence/:mac', camaras.addNewIncidence); // Añade nueva incidencia para un usuario
    app.post('/updateincidences', camaras.updateIncidences); // Comprueba si hay que generar nuevas incidencias


//    //petición get para acceder a la página de login
//    app.get('/login', utilities.index);
//    //petición post para hacer el login
//    app.post('/login', user.authenticate);
//    //petición post para registrar un usuario
//    app.post('/signup', user.signup);
//
//    app.post('/logout', function(req, res){
//        req.logout();
//        res.redirect('/');
//    });
//
//    app.get('/register', utilities.login);
//
//    // route middleware to make sure a user is logged in
//    function isLoggedIn(req, res, next) {
//
//        // if user is authenticated in the session, carry on
//        if (req.isAuthenticated())
//            return next();
//
//        // if they aren't redirect them to the home page
//        res.redirect('/');
//    }

}
