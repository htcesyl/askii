const mongoose = require('mongoose');

const TransactionHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["bağış", "rezervasyon", "ödeme"],
      required: true,
    },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["başarılı", "başarısız", "beklemede"],
      required: true,
    },
    transactionId: { type: String },
    description: { type: String },
  });

  module.exports = mongoose.model("TransactionHistory", TransactionHistorySchema);
  