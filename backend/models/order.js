var mongoose = require("mongoose");
var order = new mongoose.Schema(
  {
    customerDetails : {
      name: { type: String, required: true },
      email: { type: String, required: true },
      contact: { type: Number, required: true },
    },
    tab: { type: mongoose.Types.ObjectId, required: true},
    dishes: [
      {
        dishDetails: {
          id:{ type:mongoose.Types.ObjectId, required: true },
          name: { type: String, required: true },
          rate: { type: Number, required: true },
          image:{type:String}
        },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalTax:{type:Number,default:0},
    status: { type: String, required: true, default: "pending" },
    isDeleted: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    price: { type: Number, default: 0 },
    priority: { type: Number, default: 0 },
    outletDetails: {
      id: { type: mongoose.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    brandDetails: {
      id: { type: mongoose.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    tenantDetails: {
      id: { type: mongoose.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
  },
  { timestamps: true }
);

// order.createIndex( { "dishes.dishId._id": 1 } )

module.exports = mongoose.model("Order", order);
