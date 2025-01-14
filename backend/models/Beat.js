const mongoose = require('mongoose');

const beatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  picture: { type: String, required: true },
  bpm: { type: Number, required: true },
  price: { type: Number, required: true },
  genre: { type: String, required: true },
  audio: { type: String, required: true },
});

const Beat = mongoose.model('Beat', beatSchema);
module.exports = Beat;
