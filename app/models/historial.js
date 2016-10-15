// Camara Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var historialDataSchema = new Schema({
    name:  String,
    nombre: String,
    numero: String,
    time: String,
    latitude: String,
    longitude: String
});


//Export the schema
module.exports = mongoose.model('DatosHistorial', historialDataSchema);
