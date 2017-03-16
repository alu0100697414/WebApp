// Camara Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var camaraSchema = new Schema({
    server: String,                            // URL of streaming video
    name:  String,                             // MAC
    time_online: String,                       // Date when start connection
    time_offline: String,                      // Date when finish connection
    number: String,                            // Numberphone
    nombre: String,                            // Name of user
    latitude: String,                          // Latitude
    longitude: String,                         // logitud
    online: { type: Boolean, default: false }  // isOnline
});


//Export the schema
module.exports = mongoose.model('Camara', camaraSchema);
