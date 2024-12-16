const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    quantity: { type: Number },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["aktif", "kullanıldı", "iptal edildi"],
      required: true,
    },
    expirationDate: { type: Date },
    isClaimed: { type: Boolean, default: false },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
  });

  module.exports = mongoose.model("Reservation", ReservationSchema);