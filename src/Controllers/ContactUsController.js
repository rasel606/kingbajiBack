const mongoose = require("mongoose");

const contactusSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },

    details: { type: String },

    

    datetime: { type: Date, default: Date.now },
  
    referredBy: { type: String },
   
    updatetime: { type: Date, default: Date.now },
});




// Enable virtuals in JSON and Object output
transactionSchema.set("toObject", { virtuals: true });
transactionSchema.set("toJSON", { virtuals: true });

 const ContactUs = mongoose.model("ContactUs", contactusSchema);
module.exports = ContactUs