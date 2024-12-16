const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["donor", "institution", "student"], 
    required: true 
  },
  profileImageUrl: { type: String },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
});

module.exports = mongoose.model('User', userSchema);
