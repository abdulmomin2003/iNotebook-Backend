const mongoose = require("mongoose");

// Create a schema for users
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // This field is mandatory
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate emails
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set to current date
  },
});

// Export the model
const User = mongoose.model("User", UserSchema);

module.exports = User;
