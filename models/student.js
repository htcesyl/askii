const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  university: { type: String },
  entitlement: {
    amount: { type: Number },
    renewalPeriod: { type: String },
    lastRenewed: { type: Date },
  },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
  profileImageUrl: { type: String },
  gender: { 
    type: String, 
    enum: ["male", "female", "other"], 
    default: "other" 
  },
});

module.exports = mongoose.model('Student', studentSchema);
