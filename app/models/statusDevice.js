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
    name_aggressor: String,  // aggressor name
    number_aggressor: String,  // aggressor number
    battery_aggressor: String,  // aggressor battery
    time_aggressor: String,       // Last time ping aggressor
    timestamp_next_ping_aggressor: Number, // Updated time to the next ping (timestamp)
    distance: Number,   // Distance between victim and aggressor
    time_next_ping: Number,   // Time to next ping (seconds)
    time: String,       // Last time ping
    timestamp_next_ping: Number, // Updated time to the next ping (timestamp)
    panic_button_time: Number, // Timestamp when panic button was pushed
    battery: String     // Batery level of the user
});


//Export the schema
module.exports = mongoose.model('statusDevice', statusDeviceSchema);
