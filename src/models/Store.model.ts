import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const StoreSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4,
    required: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit pincode"],
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  googleReviewPid: {
    type: String,
    trim: true,
    validate: {
      validator: async function (value: string) {
        if (!value) return true;

        const count = await mongoose.models.Store.countDocuments({
          googleReviewPid: value,
          isActive: true,
          _id: { $ne: this._id },
        });

        return count === 0;
      },
      message: "A store with this Google Review PID already exists",
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Store = mongoose.model("Store", StoreSchema);

export default Store;
