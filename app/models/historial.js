// Camara Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var historialDataSchema = new Schema({
    name:  String,     // MAC
    nombre: String,    // Name of user
    numero: String,    // Numberphone
    time: String,      // Date of connection
    latitude: String,  // Latitud
    longitude: String  // Longitud
});


//Export the schema
module.exports = mongoose.model('DatosHistorial', historialDataSchema);
