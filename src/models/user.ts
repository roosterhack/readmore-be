import mongoose, { mongo } from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  customerStripeId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
