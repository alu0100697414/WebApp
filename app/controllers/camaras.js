/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('underscore');
var Camara = require('../../app/models/camara');
var Historial = require('../../app/models/historial');
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

  var pub_android = new Buffer("18f22134b490ee036f54238ee464e24e77f95033a603b7f013c03e701612e5ed", 'hex');
  var pri_android = new Buffer("e4c1d53b4e905f0b663a29ee59cf86a8", 'hex');

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
