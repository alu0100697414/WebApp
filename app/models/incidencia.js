// statusDevice Class
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var incidencesSchema = new Schema({
    mac: String,        // MAC
    name:  String,      // Name of the user
    number: String,     // Numberphone of the user
    type_incidence: Number,   // Latitude
    text_incidence: String,  // logitud
    time: String   // Distance between victim and aggressor
});


//Export the schema
module.exports = mongoose.model('incidences', incidencesSchema);
