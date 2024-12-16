const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: {
    street: { type: String },
    district: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  profileImageUrl: { type: String },
  openingHours: { type: String },
  services: [
    {
      serviceType: { type: String },
      description: { type: String },
    }
  ],
  donations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donation" }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  authorizedPersonId: { type: mongoose.Schema.Types.ObjectId, ref: "AuthorizedPerson" },
});

module.exports = mongoose.model('Institution', institutionSchema);
