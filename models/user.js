const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
   username: { type: String, required: true, unique: true },
   email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: [/.+\@.+\..+/, 'Please enter a valid email address']  // Email validation
   },
   phone: { 
      type: String, 
      required: true, 
      unique: true, 
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']  // Phone number validation (for 10 digits)
   },
   password: { type: String, required: true }
});

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
   if (this.isModified('password') || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
   }
   next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(plainPassword) {
   return bcrypt.compare(plainPassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
