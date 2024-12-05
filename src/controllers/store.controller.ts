// src/controllers/store.controller.ts
import { Request, Response } from "express";
import Store from "../models/Store.model";
import mongoose from "mongoose";

class StoreController {
  static async createStore(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const {
        storeName,
        address,
        city,
        pincode,
        state,
        latitude,
        longitude,
        googleReviewPid,
      } = req.body;

      const newStore = new Store({
        storeName,
        address,
        city,
        pincode,
        state,
        location: {
          latitude,
          longitude,
        },
        googleReviewPid,
        createdBy: req.user.id,
      });

      const savedStore = await newStore.save();

      res.status(201).json({
        message: "Store created successfully",
        store: savedStore,
      });
    } catch (error) {
      console.error("Create store error:", error);

      // Handle unique constraint violation for googleReviewPid
      if (
        error instanceof mongoose.Error.ValidationError ||
        (error as any).code === 11000
      ) {
        if (
          (error as any).keyPattern &&
          (error as any).keyPattern.googleReviewPid
        ) {
          return res.status(400).json({
            message: "A store with this Google Review PID already exists",
          });
        }

        return res.status(400).json({
          message: "Validation Error",
          errors: Object.values(
            (error as mongoose.Error.ValidationError).errors
          ).map((err) => err.message),
        });
      }

      res.status(500).json({ message: "Server error while creating store" });
    }
  }

  // Get all stores
  static async getAllStores(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Optional query parameters for filtering
      const { city, state, active } = req.query;

      const filter: any = {
        createdBy: req.user.id, // Only get stores created by the authenticated user
      };

      if (city) filter.city = city;
      if (state) filter.state = state;
      if (active !== undefined) filter.isActive = active === "true";

      const stores = await Store.find(filter);

      res.json({
        message: "Stores retrieved successfully",
        count: stores.length,
        stores,
      });
    } catch (error) {
      console.error("Get stores error:", error);
      res.status(500).json({ message: "Server error while retrieving stores" });
    }
  }

  // Get store by ID
  static async getStoreById(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;

      console.log("id====>", id);

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalssid store ID" });
      }

      const store = await Store.findOne({
        _id: id,
        createdBy: req.user.id,
      });

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json({
        message: "Store retrieved successfully",
        store,
      });
    } catch (error) {
      console.error("Get store by ID error:", error);
      res.status(500).json({ message: "Server error while retrieving store" });
    }
  }

  // Update store
  static async updateStore(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };

      // If location is being updated, ensure both lat and long are provided
      if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
        updateData.location = {
          latitude: req.body.latitude,
          longitude: req.body.longitude,
        };
      }

      // Check for existing googleReviewPid before updating
      if (updateData.googleReviewPid) {
        const existingStore = await Store.findOne({
          googleReviewPid: updateData.googleReviewPid,
          _id: { $ne: id }, // Exclude current store
        });

        if (existingStore) {
          return res.status(400).json({
            message: "A store with this Google Review PID already exists",
          });
        }
      }

      const updatedStore = await Store.findOneAndUpdate(
        { _id: id, createdBy: req.user.id },
        updateData,
        {
          new: true, // Return the updated document
          runValidators: true, // Run model validations on update
        }
      );

      if (!updatedStore) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json({
        message: "Store updated successfully",
        store: updatedStore,
      });
    } catch (error) {
      console.error("Update store error:", error);

      // Handle validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          message: "Validation Error",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({ message: "Server error while updating store" });
    }
  }

  // Delete store (soft delete)
  static async deleteStore(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid store ID" });
      }

      const deletedStore = await Store.findOneAndUpdate(
        { _id: id, createdBy: req.user.id },
        {
          isActive: false,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!deletedStore) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json({
        message: "Store soft deleted successfully",
        store: deletedStore,
      });
    } catch (error) {
      console.error("Delete store error:", error);
      res.status(500).json({ message: "Server error while deleting store" });
    }
  }
}

export default StoreController;
