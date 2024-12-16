const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "TransactionHistory" },
    amount: { type: Number },
    status: {
      type: String,
      enum: ["başarılı", "başarısız"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["kredi kartı", "nakit"],
      required: true,
    },
    paymentDetails: { type: String },
    date: { type: Date, default: Date.now },
  });

   module.exports = mongoose.model("Payment", PaymentSchema);