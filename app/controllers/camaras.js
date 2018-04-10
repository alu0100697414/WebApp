/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');
var Camara = require('../../app/models/camara');
var Historial = require('../../app/models/historial');
var StatusDevice = require('../../app/models/statusDevice');
var Indidencias = require('../../app/models/incidencia');
var Utilities = require('./utilities');
var crypto = require('crypto');
var ecdh = require('ecdh');
var nodemailer = require('nodemailer');

var error = {'response' : 404};
var error_400 = {'response' : 400};
var error_400_1 = {'responseEO' : 400};
var ok = {'response' : 201};

var fs = require('fs');

var Encrypt;

Encrypt = (function() {

  // Pick some curve
  var curve = ecdh.getCurve('secp128r1'),
  // Generate random keys for Alice and Bob
  aliceKeys = ecdh.generateKeys(curve),
  bobKeys = ecdh.generateKeys(curve);

  var pub_android = new Buffer("G2YIoex+dKUX1nsMWmmraybgACjvR5dvlYg8BwKPWLw=", 'base64');
  var pri_android = new Buffer("dn+4hiljaIyNrvsdTlcAlw==", 'base64');

  var publica = ecdh.PublicKey.fromBuffer(curve, pub_android);
  var privada = ecdh.PrivateKey.fromBuffer(curve, pri_android);

  var comp = privada.deriveSharedSecret(publica);

  var cipher_desencriptar, cipher_encriptar, decrypt, encrypt, iv, key;
  key = crypto.createHash("sha256").update(comp.toString('hex')).digest();
  iv = '4e5Wa71fYoT7MFEX';

  cipher_desencriptar = function(mode, data) {
    var encipher, encoded;
    encipher = crypto[mode]("aes-256-cbc", key, iv);
    encoded = encipher.update(data,'base64','utf8');
    encoded += encipher.final('utf8');
    return encoded;
  };
  cipher_encriptar = function(mode, data) {
    var encipher, encoded;
    encipher = crypto[mode]("aes-256-cbc", key, iv);
    encoded = encipher.update(data,'utf8','base64');
    encoded += encipher.final('base64');
    return encoded;
  };
  encrypt = function(data) {
    return cipher_encriptar("createCipheriv", data);
  };
  decrypt = function(data) {
    return cipher_desencriptar("createDecipheriv", data);
  };
  return {
    encrypt: encrypt,
    decrypt: decrypt
  };
})();

/* Util functions */
function getFormattedDate() {
    var date = new Date();
    var str = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " - ";

    if(date.getHours() <= 9){
      str = str + "0" + date.getHours();
    } else {
      str = str + date.getHours();
    }

    str = str + ":";

    if(date.getMinutes() <= 9){
      str = str + "0" + date.getMinutes();
    } else {
      str = str + date.getMinutes();
    }

    return str;
}

// Convierte en radianes
function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

// Devuelve la distancia entre dos puntos geolocalizados
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  //has a problem with the .toRad() method below.
  var dLat = toRad((lat2-lat1));
  var dLon = toRad((lon2-lon1));
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  if(isNaN(d) == false){
    return Math.round(d * 1000) / 1000;
  } else {
    return -1;
  }
}

// Devuelve el tiempo en segundos hasta el próximo ping
// según la distancia que haya entre víctima y agresor.
function getTimeToNextPing(distance) {

  if(distance >= 0 && distance <= 5){
    return 10;
  } else if(distance > 5 && distance <= 10){
    return 120;
  } else if(distance > 10 && distance <= 50){
    return 300;
  } else if(distance > 50 && distance <= 100){
    return 1200;
  } else if(distance > 100 && distance <= 200){
    return 2400;
  } else if(distance > 200 && distance <= 500){
    return 3600;
  } else if(distance > 500 && distance <= 1000){
    return 6000;
  } else if(distance > 1000){
    return 8400;
  } else {
    return 10;
  }
}

// Devuelve los segundos en minutos
function getMinutes(value) {
    return Math.ceil(value/60);
}

// Devuelve los segundos en horas
function getHours(value) {
    return Math.ceil(value/3600);
}

/* Views Responce */
exports.index = function (req, res) {
    res.render('camaras');
};

exports.addindex = function (req, res) {
    res.render('add_camara');
};

exports.listindex = function (req, res) {
    res.render('list_camara');
};

exports.historialindex = function (req, res) {
    res.render('historial');
};

exports.estadoindex = function (req, res) {
    res.render('estado');
};

exports.estadoagresoresindex = function (req, res) {
    res.render('estadoagresores');
};

exports.incidenciasindex = function (req, res) {
    res.render('incidencias');
};

exports.mapaindex = function (req, res) {
    res.render('mapa');
};

exports.contactindex = function (req, res) {
    res.render('contacto');
};

exports.emailsent = function (req, res) {
    res.render('emailenviado');
};

exports.emailerror = function (req, res) {
    res.render('emailerrorview');
};

/************************************************************************************/
/*******    API Responces                                                  **********/
/************************************************************************************/

/* All cams */
exports.getall = function (request, response) {
    Camara.find(function (err, camaras) {
        if (!err) {
            response.send(camaras);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* Get historial */
exports.getHistorial = function (request, response) {
    Historial.find({}, null, {sort: {time: -1}},function (err, historiales) {
        if (!err) {
            response.send(historiales);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* Borrar historial de conexiones */
exports.deleteHistorial = function (request, response) {
  Historial.remove({}, function (err) { });
};

/* Get estado */
exports.getEstado = function (request, response) {

    // Para ver si muestra ubicación en función del botón de pánico
    var min_timestamp = Math.floor(Date.now()/1000) - 1800;

    StatusDevice.find({}, null, {sort: {distance: -1}},function (err, estados) {
        if (!err) {

            // Calculamos el tiempo restante hasta el siguiente ping
            var current_date = Math.floor(Date.now()/1000);
            for(var i=0; i<estados.length; i++){
                if((estados[i].timestamp_next_ping - current_date) >= 3600){
                    estados[i].updated_date = "Menos de " + getHours(estados[i].timestamp_next_ping - current_date) + "h";
                } else if((estados[i].timestamp_next_ping - current_date) > 60 && (estados[i].timestamp_next_ping - current_date) < 3600){
                    estados[i].updated_date = "Menos de " + getMinutes(estados[i].timestamp_next_ping - current_date) + "min";
                } else if((estados[i].timestamp_next_ping - current_date) > 0 && (estados[i].timestamp_next_ping - current_date) <= 60){
                    estados[i].updated_date = estados[i].timestamp_next_ping - current_date + "s";
                } else {
                    estados[i].updated_date = "Esperando...";
                }
            }
            
            response.send([estados, min_timestamp]);
        } else {
            console.log(err);
            response.send(error);
        }
    }).lean();
};

/* Get estado agresores */
exports.getEstadoAgresores = function (request, response) {

    // Para ver si muestra ubicación en función del botón de pánico
    var min_timestamp = Math.floor(Date.now()/1000) - 1800;

    StatusDevice.find({}, null, {sort: {distance: -1}},function (err, estados) {
        if (!err) {

            // Calculamos el tiempo restante hasta el siguiente ping
            var current_date = Math.floor(Date.now()/1000);
            for(var i=0; i<estados.length; i++){
                if((estados[i].timestamp_next_ping - current_date) >= 3600){
                    estados[i].updated_date = "Menos de " + getHours(estados[i].timestamp_next_ping - current_date) + "h";
                } else if((estados[i].timestamp_next_ping - current_date) > 60 && (estados[i].timestamp_next_ping - current_date) < 3600){
                    estados[i].updated_date = "Menos de " + getMinutes(estados[i].timestamp_next_ping - current_date) + "min";
                } else if((estados[i].timestamp_next_ping - current_date) > 0 && (estados[i].timestamp_next_ping - current_date) <= 60){
                    estados[i].updated_date = estados[i].timestamp_next_ping - current_date + "s";
                } else {
                    estados[i].updated_date = "Esperando...";
                }
            }
            
            response.send([estados, min_timestamp]);
        } else {
            console.log(err);
            response.send(error);
        }
    }).lean();
};

/* Get incidencias */
exports.getIncidencias = function (request, response) {
    Indidencias.find({}, null, {sort: {time: -1}},function (err, incidencias) {
        if (!err) {
            response.send(incidencias);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* All cams */
exports.getalllive = function (request, response) {
    Camara.find({online : true}, function (err, camaras) {
        if (!err) {
            response.send(camaras);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* Delete */
exports.delete = function (request, response) {
    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        camara.remove();
        response.send(ok);
    });
};

/* Delete Inciende */
exports.deleteIncidencias = function (request, response) {
    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Indidencias.findOne({_id: request.params.id}, function (err, inc) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(inc)) return response.send(error);
        inc.remove();
        response.send(ok);
    });
};

/* New camera */
exports.new = function (request, response) {

    if ( Utilities.isEmpty(request.body.name)) return response.send(error_400);
    if ( Utilities.isEmpty(request.body.server)) return response.send(error_400);

    var Dname = Encrypt.decrypt(request.body.name);
    var Dserver = Encrypt.decrypt(request.body.server);

    Camara.find({name: Dname}).exec(function (err, camaras) {

        if (err) return response.send(error);
        if (!Utilities.isEmpty(camaras)) return response.send(error);

        var server = "rtmp://" + Dserver + Dname;
        var camaranueva = new Camara({ server: server, name: Dname});
        camaranueva.save();

        response.send(ok);
    });
};

/* ¿on Live? */
exports.getisonline = function (request, response) {
    if (Utilities.isEmpty(request.params.id)) return response.send(error_400);
    Camara.findOne({_id: request.params.id}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        response.send(camara.online);
    });
};

/* on Live */
exports.putonline = function (request, response) {

    if (Utilities.isEmpty(request.params.name)) return response.send(error_400);

    if (Utilities.isEmpty(request.body.name)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.server)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.time_now)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.latitude)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.longitude)) return response.send(error_400);

    var DTime_now = Encrypt.decrypt(request.body.time_now);
    var DNombre = Encrypt.decrypt(request.body.nombre);
    var DNumero = Encrypt.decrypt(request.body.numero);
    var DServer = Encrypt.decrypt(request.body.server);
    var DLatitude = Encrypt.decrypt(request.body.latitude);
    var DLongitude = Encrypt.decrypt(request.body.longitude);

    Camara.find({name: request.params.name}).exec(function (err, camara) {

        if (err) response.send(error_400);
        if (Utilities.isEmpty(camara)) return response.send(error_400);

        camara[0].online = true;
        camara[0].time_online = DTime_now;
        camara[0].number = DNumero;
        camara[0].nombre = DNombre;
        camara[0].latitude = DLatitude;
        camara[0].longitude = DLongitude;
        camara[0].save();

        Historial.find({name: request.params.name}).exec(function (err, historiales) {
            if (err) return response.send(error);

            var server = "rtmp://" + DServer + request.params.name;
            var historial_nuevo = new Historial({ name: request.params.name, nombre: DNombre, numero: DNumero, time: DTime_now, latitude: DLatitude, longitude: DLongitude });
            historial_nuevo.save();

            response.send(ok);
        });
    });
};

/* off Live  */
exports.putoffline = function (request, response) {
    if (Utilities.isEmpty(request.params.name)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.date_last_online)) return response.send(error_400);

    var DTime_now = Encrypt.decrypt(request.body.date_last_online);

    Camara.find({name: request.params.name}).exec(function (err, camara) {
        if (err) response.send(error_400);
        if (Utilities.isEmpty(camara)) return response.send(error_400);
        camara[0].online = false;
        camara[0].time_offline = DTime_now;
        camara[0].save();
        response.send(ok);
    });
};

/* update state of victim's devices */
exports.updateStateDevice = function (request, response) {

    if (Utilities.isEmpty(request.params.mac)) return response.send(error_400);

    if (Utilities.isEmpty(request.body.name)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.number)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.latitude)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.longitude)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.battery)) return response.send(error_400);

    var DName = Encrypt.decrypt(request.body.name);
    var DNumber = Encrypt.decrypt(request.body.number);
    var DLatitude = Encrypt.decrypt(request.body.latitude);
    var DLongitude = Encrypt.decrypt(request.body.longitude);
    var DBattery = Encrypt.decrypt(request.body.battery);

    StatusDevice.find({mac: request.params.mac}).exec(function (err, device) {

        if (err) return response.send(error);

        // If it is empty, a new device will be saved on db
        if (Utilities.isEmpty(device)){
          var new_state = new StatusDevice({ mac: request.params.mac, name: DName, number: DNumber, latitude: DLatitude, longitude: DLongitude, distance: 0, time_next_ping: 10, timestamp_next_ping: Math.floor(Date.now()/1000) + 10, time: getFormattedDate(), panic_button_time: 0, battery: DBattery + "%" });
          new_state.save();

          response.send(ok);
        } else {

          // Obtenemos la distancia entre víctima y agresor
          var d = getHaversineDistance(DLatitude, DLongitude, device[0].latitude_aggressor, device[0].longitude_aggressor);

          // Obtenemos el tiempo hasta el proximo ping
          var time_to_next_ping = getTimeToNextPing(d);

          // Actializamos la información de la víctima y el estado de su dispositivo
          console.log("Latitud víctima: " + DLatitude);
          console.log("Longitud víctima: " + DLongitude);
          console.log("Siguiente ping en: " + time_to_next_ping + " segundos.");

          device[0].name = DName;
          device[0].number = DNumber;
          device[0].latitude = DLatitude;
          device[0].longitude = DLongitude;
          device[0].distance = d;
          device[0].time = getFormattedDate();
          device[0].time_next_ping = time_to_next_ping;
          device[0].timestamp_next_ping = Math.floor(Date.now()/1000) + time_to_next_ping;
          device[0].battery = DBattery + "%";
          device[0].save();

          // Si la distancia es menor a 1 km, generamos una incidencia
          if(d < 1 && d != -1){
            Indidencias.findOne({mac: request.params.mac, type_incidence: 3}, {}, { sort: {'time' : -1} }, function(err, inc) {
              if (!err){
                // Si no ha generado ninguna incidencia de este tipo, se genera automáticamente
                if(inc == null){
                    var new_inc = new Indidencias({ mac: request.params.mac, name: DName, number: DNumber, type_incidence: 3, text_incidence: "El agresor está a " + d + " Km de la víctima", time: getFormattedDate() });
                    new_inc.save();
                } else {
                    inc.name = DName;
                    inc.number = DNumber;
                    inc.text_incidence = "El agresor está a " + d + " Km de la víctima";
                    inc.time = getFormattedDate();
                    inc.save();
                }
              } else {
                throw err;
              }
            });
          }

          // Se genera incidencia si no se consigue calcular la distancia entre víctima y agresor.
          else if(d == -1) {
            Indidencias.findOne({mac: request.params.mac, type_incidence: 5}, {}, { sort: {'time' : -1} }, function(err, inc) {
              if (!err){
                // Si no ha generado ninguna incidencia de este tipo, se genera automáticamente
                if(inc == null){
                    var new_inc = new Indidencias({ mac: request.params.mac, name: DName, number: DNumber, type_incidence: 5, text_incidence: "No se ha podido calcular la distancia", time: getFormattedDate() });
                    new_inc.save();
                } else {
                    inc.name = DName;
                    inc.number = DNumber;
                    inc.text_incidence = "No se ha podido calcular la distancia";
                    inc.time = getFormattedDate();
                    inc.save();
                }
              } else {
                throw err;
              }
            });
          }

          response.send({"distancia": d, "nextPing": time_to_next_ping});
        }
    });
};

/* update the time when a panic button is pushed in a device */
exports.updatePanicButton = function (request, response) {

    if (Utilities.isEmpty(request.params.mac)) return response.send(error_400);

    StatusDevice.find({mac: request.params.mac}).exec(function (err, device) {

        if (err) return response.send(error);

        // Si no existe el dispositivo, no se puede guardar el timestamp
        if (Utilities.isEmpty(device)){

            response.send(error);
        } 
        
        else {

            // Actualizamos el timestamp
            device[0].panic_button_time = Math.floor(Date.now()/1000);
            device[0].save();

            // Se genera una incidencia
            var new_inc = new Indidencias({ mac: request.params.mac, name: device[0].name, number: device[0].number, type_incidence: 6, text_incidence: "La víctima ha pulsado el botón de pánico.", time: getFormattedDate() });
            new_inc.save();

            response.send(ok);
        }
    });
};

/* add new incidence */
exports.deleteStatusDevice = function (request, response) {

    if ( Utilities.isEmpty(request.params.id)) return response.send(error_400);
    StatusDevice.findOne({_id: request.params.id}, function (err, statusdevice) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(statusdevice)) return response.send(error);
        statusdevice.remove();
        response.send(ok);
    });
};

/* add new incidence */
exports.addNewIncidence = function (request, response) {

    if (Utilities.isEmpty(request.params.mac)) return response.send(error_400);

    if (Utilities.isEmpty(request.body.name)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.number)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.type_incidence)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.text_incidence)) return response.send(error_400);

    var DName = Encrypt.decrypt(request.body.name);
    var DNumber = Encrypt.decrypt(request.body.number);
    var DTypeIncidence = Encrypt.decrypt(request.body.type_incidence);
    var DTextIncidence = Encrypt.decrypt(request.body.text_incidence);

    var new_inc = new Indidencias({ mac: request.params.mac, name: DName, number: DNumber, type_incidence: DTypeIncidence, text_incidence: DTextIncidence, time: getFormattedDate() });
    new_inc.save();

    response.send(ok);
};

/* add new incidence */
exports.updateIncidences = function (request, response) {

    // Buscamos todos los dispositivos para comprobar si hay que generar incidencias del tipo 2
    StatusDevice.find({}, function(err, estados) {
        if (!err){
          // Comprobamos para cada dispositivo si lleva un tiempo determinado sin enviar un ping
          for (var i = 0; i < estados.length; i++) {
            // Tiempo actual
            var time_now = Math.floor(Date.now() / 1000);

            // Ultima vez del ping del usuario
            var dateString = estados[i].time, dateTimeParts = dateString.split(' - '), timeParts = dateTimeParts[1].split(':'), dateParts = dateTimeParts[0].split('/'), date;
            var time = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]).getTime() / 1000;

            // Si lleva más del tiempo determinado para el ping mas 5 segundos extra, se genera incidencia
            if(((estados[i].timestamp_next_ping + 5) - (Math.floor(Date.now()/1000))) < 0){
              // Creamos o actualizamos la incidencia correspondiente
              Indidencias.update (
                { mac: estados[i].mac, type_incidence: 2 },
                { mac: estados[i].mac, name: estados[i].name, number: estados[i].number, type_incidence: 2, text_incidence: "El dispositivo está inactivo", time: getFormattedDate() },
                { sort: {'time' : -1}, upsert: true },
                function(err, inc) {
                  if (err){
                    throw err;
                  }
              });
            }
          };
        } else {
          throw err;
        }
    });

    // Indidencias.remove({}, function(err) {
    //    console.log('collection removed')
    // });

    response.send(ok);
};

/* All cams */
exports.getallstatusdevice = function (request, response) {

    var min_timestamp = Math.floor(Date.now()/1000) - 1800;

    StatusDevice.find({$or: [{ distance: { $lt: 1 }}, { panic_button_time: { $gt: min_timestamp } }] }, {}, { sort: {'distance' : -1} }, function (err, camaras) {
        if (!err) {
            response.send(camaras);
        } else {
            console.log(err);
            response.send(error);
        }
    });
};

/* update markers del mapa actual */
exports.updatemarkers = function (request, response) {

    var min_timestamp = Math.floor(Date.now()/1000) - 1800;

    StatusDevice.findOne({_id: request.params.id, $or: [{ distance: { $lt: 1 }}, { panic_button_time: { $gt: min_timestamp } }]}, function (err, camara) {
        if (err) return response.send(error);
        if (Utilities.isEmpty(camara)) return response.send(error);
        response.send(camara);
    });
};

/* update the GPS position of aggressor for a victim */
exports.updateAggressorPosition = function (request, response) {

    if (Utilities.isEmpty(request.params.victim_mac)) return response.send(error_400);

    if (Utilities.isEmpty(request.body.latitude_aggressor)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.longitude_aggressor)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.aggressor_name)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.aggressor_number)) return response.send(error_400);
    if (Utilities.isEmpty(request.body.aggressor_battery)) return response.send(error_400);

    console.log(request.body.aggressor_name);
    console.log(request.body.latitude_aggressor);
    console.log(request.body.longitude_aggressor);

    StatusDevice.find({mac: request.params.victim_mac}).exec(function (err, device) {

      if (err) return response.send(error);

      // If it is empty, a new device will be saved on db
      if (!Utilities.isEmpty(device)){
        var d = device[0].distance;

        device[0].latitude_aggressor = request.body.latitude_aggressor;
        device[0].longitude_aggressor = request.body.longitude_aggressor;
        device[0].name_aggressor = request.body.aggressor_name;
        device[0].number_aggressor = request.body.aggressor_number;
        device[0].battery_aggressor = request.body.aggressor_battery + "%";
        device[0].time_aggressor = getFormattedDate();
        device[0].timestamp_next_ping_aggressor = Math.floor(Date.now()/1000) + 15;
        device[0].save();
        response.send({"distancia": d});
      }
    })
};

/* Send an email from contact form */
exports.contactEmail = function (request, response) {

    var CONTACT_EMAIL = "";
    var CONTACT_PASSWORD = "";

    var mailOpts, smtpTrans;
    
    // Email parameters
    smtpTrans = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: CONTACT_EMAIL, pass: CONTACT_PASSWORD }
    });

    // Email content
    mailOpts = {
        from: request.body.name + '(' + request.body.email + ')',
        to: CONTACT_EMAIL,
        subject: request.body.subject,
        text: 'De: ' + request.body.name + ' ' + request.body.surname + ' (' + request.body.email + ')\n\n' + request.body.textemail
    };

    // Send email and response
    smtpTrans.sendMail(mailOpts, function (error, res) {
        if (error) {
            console.log(error);
            response.render('emailerrorview');
        } else {
            console.log("Email sent");
            response.render('emailenviado');
        }
    });
};
