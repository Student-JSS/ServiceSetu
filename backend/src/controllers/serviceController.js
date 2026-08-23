import { Service } from "../models/Service.js";
import { Cooperative } from "../models/Cooperative.js";

// Categories metadata
export const PREDEFINED_CATEGORIES = [
  { id: "electrician", name: "Electrician", icon: "Zap", description: "Wiring, fixtures, appliances & circuit repairs" },
  { id: "plumber", name: "Plumber", icon: "Droplets", description: "Pipe leaks, tap fixing, sanitary & water tank repairs" },
  { id: "carpenter", name: "Carpenter", icon: "Hammer", description: "Furniture repair, door fitting, modular woodwork" },
  { id: "painter", name: "Painter", icon: "Paintbrush", description: "Interior & exterior wall painting, waterproof coatings" },
  { id: "cleaner", name: "Deep Cleaner", icon: "Sparkles", description: "Home deep cleaning, sofa/kitchen sanitization" },
  { id: "caregiver", name: "Caregiver & Nurse", icon: "HeartHandshake", description: "Elderly care, patient support, post-op aid" },
  { id: "driver", name: "Professional Driver", icon: "Car", description: "Personal & commercial vehicle driving on demand" },
  { id: "gardener", name: "Gardener", icon: "Trees", description: "Lawn mowing, plant pruning, landscaping & pest control" },
  { id: "technician", name: "Appliance Technician", icon: "Wrench", description: "AC servicing, refrigerator, microwave & washing machines" },
  { id: "domestic helper", name: "Domestic Helper", icon: "Home", description: "Cooking, household assistance & daily upkeep" },
];

// 1. Get All Services (Optionally filtered by category or cooperative)
export const getAllServices = async (req, res) => {
  try {
    const { category, cooperativeId } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (cooperativeId) query.cooperativeId = cooperativeId;

    const services = await Service.find(query).populate("cooperativeId", "name city state surgeMultiplier codEnabled");

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Predefined Categories List
export const getCategories = async (req, res) => {
  res.status(200).json({
    success: true,
    categories: PREDEFINED_CATEGORIES,
  });
};

// 3. Create Service (Co-op Admin / Federation Admin)
export const createService = async (req, res) => {
  try {
    const { name, category, description, durationEstimateMinutes, basePrice, cooperativeId, iconName } = req.body;

    let targetCoop = cooperativeId;
    if (!targetCoop && req.user.role === "coop_admin") {
      const adminCoop = await Cooperative.findOne({ adminUserId: req.user._id });
      targetCoop = adminCoop?._id;
    }

    const service = await Service.create({
      name,
      category,
      description,
      durationEstimateMinutes: durationEstimateMinutes || 60,
      basePrice: parseFloat(basePrice),
      cooperativeId: targetCoop,
      iconName: iconName || "Wrench",
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Service deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
