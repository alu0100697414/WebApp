// statusDevice Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var statusDeviceSchema = new Schema({
    mac: String,        // MAC
    name:  String,      // Name of the user
    number: String,     // Numberphone of the user
    latitude: String,   // victim latitude
    longitude: String,  // victim longitude
    latitude_aggressor: String,   // aggressor latitude
    longitude_aggressor: String,  // aggressor longitude
    distance: Number,   // Distance between victim and aggressor
    time: String,       // Last time ping
    battery: String     // Batery level of the user
});


//Export the schema
module.exports = mongoose.model('statusDevice', statusDeviceSchema);
