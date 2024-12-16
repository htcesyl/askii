const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["beklemede", "onaylandı", "iptal edildi"], 
      required: true 
    },
    productsDonated: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number },
      }
    ],
  });
  
  module.exports = mongoose.model('Donation', donationSchema);
  