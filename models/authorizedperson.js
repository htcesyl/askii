const mongoose = require('mongoose');

const AuthorizedPersonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    position: { type: String },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
  });

  module.exports = mongoose.model("AuthorizedPerson", AuthorizedPersonSchema);