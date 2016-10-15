// Camara Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var camaraSchema = new Schema({
    server: String,
    name:  String,
    time_online: String,
    time_offline: String,
    number: String,
    nombre: String,
    latitude: String,
    longitude: String,
    online: { type: Boolean, default: false }
});


//Export the schema
module.exports = mongoose.model('Camara', camaraSchema);
