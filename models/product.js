const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    stock: { type: Number },
    availableStock: { type: Number },
    price: { type: Number },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    profileImageUrl: { type: String },
  });
  
  module.exports = mongoose.model('Product', productSchema);
  