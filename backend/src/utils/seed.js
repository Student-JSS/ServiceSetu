import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Federation } from "../models/Federation.js";
import { Cooperative } from "../models/Cooperative.js";
import { Worker } from "../models/Worker.js";
import { Service } from "../models/Service.js";
import { Booking } from "../models/Booking.js";
import { Rating } from "../models/Rating.js";
import { Grievance } from "../models/Grievance.js";
import { Notification } from "../models/Notification.js";
import { PREDEFINED_CATEGORIES } from "../controllers/serviceController.js";

export const seedDatabase = async () => {
  try {
    console.log("🌱 Checking and seeding initial cooperative data...");

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("⚡ Database already has data. Skipping fresh seed.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const fedPasswordHash = await bcrypt.hash("FedCoop@2026!Secured", salt);
    const coopPasswordHash = await bcrypt.hash("coop123", salt);
    const customerPasswordHash = await bcrypt.hash("pass123", salt);
    const workerPasswordHash = await bcrypt.hash("worker123", salt);

    // 1. Create Federation Admin
    const fedAdminUser = await User.create({
      fullName: "National Federation Director",
      email: "admin@federation.coop",
      phone: "9900000001",
      passwordHash: fedPasswordHash,
      role: "fed_admin",
      language: "en",
    });

    const federation = await Federation.create({
      name: "National Labour Cooperative Federation of India",
      adminUserId: fedAdminUser._id,
      state: "National",
      platformFeePercent: 5.0,
    });

        // 2. Create Regional Cooperative Societies & Admins
    const coopAdmin1 = await User.create({
      fullName: "Ramesh Sharma (Central Delhi Co-op)",
      email: "admin@shramik.coop",
      phone: "9900000002",
      passwordHash: coopPasswordHash,
      role: "coop_admin",
      language: "en",
    });

    const cooperative1 = await Cooperative.create({
      name: "Shramik Seva Sahakari Society (Central Delhi)",
      federationId: federation._id,
      adminUserId: coopAdmin1._id,
      city: "Central Delhi",
      state: "Delhi",
      address: "Connaught Place, New Delhi - 110001",
      location: {
        type: "Point",
        coordinates: [77.2167, 28.6327], // Connaught Place
      },
      commissionRate: 5.0,
      codEnabled: true,
      surgeMultiplier: 1.25,
    });

    const coopAdmin2 = await User.create({
      fullName: "Sunita Verma (South Delhi Co-op)",
      email: "admin@karigar.coop",
      phone: "9900000003",
      passwordHash: coopPasswordHash,
      role: "coop_admin",
      language: "en",
    });

    const cooperative2 = await Cooperative.create({
      name: "Karigar Kalyan Sahakari Society (South Delhi)",
      federationId: federation._id,
      adminUserId: coopAdmin2._id,
      city: "South Delhi",
      state: "Delhi",
      address: "Saket District Centre, New Delhi - 110017",
      location: {
        type: "Point",
        coordinates: [77.2155, 28.5244], // Saket
      },
      commissionRate: 5.0,
      codEnabled: true,
      surgeMultiplier: 1.2,
    });

    const coopAdmin3 = await User.create({
      fullName: "Harish Rawat (North Delhi Co-op)",
      email: "admin@northdelhi.coop",
      phone: "9900000004",
      passwordHash: coopPasswordHash,
      role: "coop_admin",
      language: "en",
    });

    const cooperative3 = await Cooperative.create({
      name: "Uttari Dilli Shramik Sahakari Samiti (North Delhi)",
      federationId: federation._id,
      adminUserId: coopAdmin3._id,
      city: "North Delhi",
      state: "Delhi",
      address: "Civil Lines & Rohini Sector 10, Delhi - 110054",
      location: {
        type: "Point",
        coordinates: [77.2274, 28.6814], // North Delhi
      },
      commissionRate: 5.0,
      codEnabled: true,
      surgeMultiplier: 1.25,
    });

    const coopAdmin4 = await User.create({
      fullName: "Praveen Yadav (West Delhi Co-op)",
      email: "admin@westdelhi.coop",
      phone: "9900000005",
      passwordHash: coopPasswordHash,
      role: "coop_admin",
      language: "en",
    });

    const cooperative4 = await Cooperative.create({
      name: "Pashchimi Dilli Karigar Sahakari Society (West Delhi)",
      federationId: federation._id,
      adminUserId: coopAdmin4._id,
      city: "West Delhi",
      state: "Delhi",
      address: "Rajouri Garden & Janakpuri, New Delhi - 110027",
      location: {
        type: "Point",
        coordinates: [77.1215, 28.6465], // West Delhi
      },
      commissionRate: 5.0,
      codEnabled: true,
      surgeMultiplier: 1.25,
    });

    // 3. Create Services Catalog
    const serviceList = [
      {
        name: "Fan, Light & Switchboard Repair",
        category: "electrician",
        basePrice: 349,
        durationEstimateMinutes: 45,
        iconName: "Zap",
        description: "Fix circuit trips, sparkings, ceiling fan regulator, light fittings, and socket wiring tests with safety equipment."
      },
      {
        name: "Complete Home Electrical Inspection",
        category: "electrician",
        basePrice: 699,
        durationEstimateMinutes: 90,
        iconName: "Zap",
        description: "Full circuit load audit, MCB distribution board safety check, earthing leakage test, and thermal hotspot scanning."
      },
      {
        name: "Tap Leakage & Pipe Joint Fixing",
        category: "plumber",
        basePrice: 299,
        durationEstimateMinutes: 40,
        iconName: "Droplets",
        description: "High-pressure pipe joint repair, brass tap washer replacement, basin mixer seal fixing, and zero-drip testing."
      },
      {
        name: "Bathroom Sanitary & Blockage Clear",
        category: "plumber",
        basePrice: 499,
        durationEstimateMinutes: 60,
        iconName: "Droplets",
        description: "Heavy-duty drain snake unclogging for washbasins, commodes, traps, and odour-free drainage flushing."
      },
      {
        name: "Door Lock & Handle Replacement",
        category: "carpenter",
        basePrice: 399,
        durationEstimateMinutes: 45,
        iconName: "Hammer",
        description: "Precision installation of mortise locks, cylindrical handles, security latches, and wooden door alignment."
      },
      {
        name: "Furniture Assembly & Wood Polishing",
        category: "carpenter",
        basePrice: 649,
        durationEstimateMinutes: 90,
        iconName: "Hammer",
        description: "Wardrobe/bed flatpack assembly, teakwood scratch buffing, PU polish touch-up, and hinge tightening."
      },
      {
        name: "Single Room Interior Painting",
        category: "painter",
        basePrice: 1199,
        durationEstimateMinutes: 180,
        iconName: "Paintbrush",
        description: "Wall putty surface preparation, 2 coats premium washable acrylic emulsion with drop-cloth floor protection."
      },
      {
        name: "Full Home Deep Cleaning (2 BHK)",
        category: "cleaner",
        basePrice: 1499,
        durationEstimateMinutes: 240,
        iconName: "Sparkles",
        description: "Single-disc floor scrubbing, tile grout descaling, glass streak-free shine, and balcony dust removal."
      },
      {
        name: "Kitchen & Chimney Degreasing",
        category: "cleaner",
        basePrice: 699,
        durationEstimateMinutes: 90,
        iconName: "Sparkles",
        description: "Removal of burnt oil & grease from baffle filters, stove burners, countertop backsplash, and cabinet exteriors."
      },
      {
        name: "Elderly Home Caregiver (Day Shift)",
        category: "caregiver",
        basePrice: 850,
        durationEstimateMinutes: 480,
        iconName: "HeartHandshake",
        description: "Compassionate certified bedside care, vital signs recording (BP/Sugar), mobility assist, and medication schedules."
      },
      {
        name: "Personal Chauffeur / Driver On-Demand",
        category: "driver",
        basePrice: 499,
        durationEstimateMinutes: 240,
        iconName: "Car",
        description: "Police-verified, experienced manual & automatic car chauffeur for city errands, outstation, or daily office commutes."
      },
      {
        name: "Lawn Mowing & Garden Trim",
        category: "gardener",
        basePrice: 449,
        durationEstimateMinutes: 120,
        iconName: "Trees",
        description: "Grass trimming, ornamental bush pruning, organic vermicompost enrichment, and potted plant weeding."
      },
      {
        name: "Split AC Servicing & Gas Top-up",
        category: "technician",
        basePrice: 599,
        durationEstimateMinutes: 60,
        iconName: "Wrench",
        description: "Jet-pump coil foam wash, drain tray unclog, copper pipe pressure inspection, and cooling gas level calibration."
      },
      {
        name: "Daily Household Cooking & Helper",
        category: "domestic helper",
        basePrice: 399,
        durationEstimateMinutes: 180,
        iconName: "Home",
        description: "Hygienic home-cooked meals (North/South Indian recipes), vegetable prep, kitchen tidy-up, and vessel assistance."
      },
    ];

    const createdServices = [];
    for (const s of serviceList) {
      const s1 = await Service.create({
        ...s,
        description: s.description,
        cooperativeId: cooperative1._id,
      });
      createdServices.push(s1);
    }

    // 4. Create Demo Customer
    const customerUser = await User.create({
      fullName: "Aarav Gupta",
      phone: "9876543210",
      email: "aarav.customer@gmail.com",
      role: "customer",
      language: "en",
      address: "B-42, Hauz Khas Enclave, New Delhi",
      location: {
        type: "Point",
        coordinates: [77.2060, 28.5494], // Hauz Khas
      },
    });

    // 5. Create Verified Skilled Workers with Locations across Delhi
    const workerData = [
      {
        fullName: "Rajesh Kumar",
        phone: "9811000101",
        skills: ["electrician", "technician"],
        experience: 6,
        radius: 20,
        coords: [77.2195, 28.6315], // Near Connaught Place
        address: "Pahar Ganj, Central Delhi",
        ratingAvg: 4.9,
        ratingCount: 28,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-081", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
      {
        fullName: "Manoj Mistri",
        phone: "9811000102",
        skills: ["plumber"],
        experience: 8,
        radius: 15,
        coords: [77.2200, 28.5700], // Lajpat Nagar
        address: "Lajpat Nagar IV, South Delhi",
        ratingAvg: 4.8,
        ratingCount: 19,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-092", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
      {
        fullName: "Suresh Sharma",
        phone: "9811000103",
        skills: ["carpenter"],
        experience: 5,
        radius: 25,
        coords: [77.2000, 28.6500], // Karol Bagh
        address: "Karol Bagh, West-Central Delhi",
        ratingAvg: 4.7,
        ratingCount: 14,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-103", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
      {
        fullName: "Pooja Devi",
        phone: "9811000104",
        skills: ["cleaner", "domestic helper"],
        experience: 4,
        radius: 15,
        coords: [77.2100, 28.5300], // Saket
        address: "Malviya Nagar, South Delhi",
        ratingAvg: 5.0,
        ratingCount: 32,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-114", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
      {
        fullName: "Vikram Singh",
        phone: "9811000105",
        skills: ["driver"],
        experience: 7,
        radius: 30,
        coords: [77.2300, 28.6100], // India Gate area
        address: "Tilak Marg, Central Delhi",
        ratingAvg: 4.9,
        ratingCount: 22,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-125", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
      {
        fullName: "Sunita Bai",
        phone: "9811000106",
        skills: ["caregiver"],
        experience: 9,
        radius: 20,
        coords: [77.1900, 28.5500], // Green Park
        address: "Green Park Extension, South Delhi",
        ratingAvg: 5.0,
        ratingCount: 15,
        insurance: { hasInsurance: true, policyNumber: "COOP-INS-2026-136", provider: "National Labour Welfare Fund", sumInsured: 300000 },
      },
    ];

    const createdWorkers = [];
    for (const wd of workerData) {
      const user = await User.create({
        fullName: wd.fullName,
        phone: wd.phone,
        role: "worker",
        language: "en",
        address: wd.address,
        location: {
          type: "Point",
          coordinates: wd.coords,
        },
      });

      const worker = await Worker.create({
        userId: user._id,
        cooperativeId: cooperative1._id,
        aadhaarNumber: "XXXX-XXXX-8921",
        skills: wd.skills,
        experienceYears: wd.experience,
        serviceRadiusKm: wd.radius,
        isVerified: true,
        isOnline: true,
        isAway: false,
        location: {
          type: "Point",
          coordinates: wd.coords,
        },
        ratingAvg: wd.ratingAvg,
        ratingCount: wd.ratingCount,
        insuranceStatus: wd.insurance,
        bankDetails: {
          accountNumber: "918237461928",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India (Cooperative Payroll)",
          accountHolderName: wd.fullName,
          upiId: `${wd.phone}@upi`,
        },
        emergencyContact: {
          name: "Family Next of Kin",
          phone: "9811999888",
          relationship: "Spouse",
        },
        documents: [
          {
            title: "Aadhaar Card (Govt UIDAI)",
            docType: "id_proof",
            fileUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
            status: "verified",
          },
          {
            title: "Skill India National Vocational Certificate",
            docType: "skill_certificate",
            fileUrl: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=400",
            status: "verified",
          },
        ],
      });

      createdWorkers.push(worker);
    }

    // 6. Create Sample Completed Bookings for Realistic Data & Charts
    const booking1 = await Booking.create({
      customerId: customerUser._id,
      workerId: createdWorkers[0]._id, // Rajesh Kumar (Electrician)
      serviceId: createdServices[0]._id,
      cooperativeId: cooperative1._id,
      status: "completed",
      isEmergency: false,
      address: "B-42, Hauz Khas Enclave, New Delhi",
      location: { type: "Point", coordinates: [77.2060, 28.5494] },
      basePrice: 349,
      totalAmount: 349,
      platformFee: 17,
      coopFee: 17,
      workerEarnings: 315,
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      customerRated: true,
      invoiceNumber: "INV-2026-EK9012",
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    await Rating.create({
      bookingId: booking1._id,
      ratedBy: customerUser._id,
      ratedTo: createdWorkers[0].userId,
      role: "customer_to_worker",
      stars: 5,
      review: "Very professional and punctual electrician. Repaired the switchboard quickly with zero hassle!",
    });

    const booking2 = await Booking.create({
      customerId: customerUser._id,
      workerId: createdWorkers[1]._id, // Manoj Mistri (Plumber)
      serviceId: createdServices[2]._id,
      cooperativeId: cooperative1._id,
      status: "completed",
      isEmergency: true,
      surgeMultiplier: 1.25,
      address: "Hauz Khas Market, New Delhi",
      location: { type: "Point", coordinates: [77.2060, 28.5494] },
      basePrice: 299,
      totalAmount: 374,
      platformFee: 19,
      coopFee: 19,
      workerEarnings: 336,
      paymentStatus: "cod_collected",
      paymentMethod: "cod",
      customerRated: true,
      invoiceNumber: "INV-2026-PL7823",
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Rating.create({
      bookingId: booking2._id,
      ratedBy: customerUser._id,
      ratedTo: createdWorkers[1].userId,
      role: "customer_to_worker",
      stars: 5,
      review: "Arrived within 15 minutes for the emergency pipe burst! Excellent cooperative service.",
    });

    // Sample grievance for admin testing
    await Grievance.create({
      workerId: createdWorkers[2]._id,
      cooperativeId: cooperative1._id,
      category: "insurance_claim",
      message: "Need assistance with medical bill reimbursement under the Co-op Welfare Insurance Policy.",
      status: "pending",
    });

    // Sample welcome notification
    await Notification.create({
      userId: customerUser._id,
      title: "Welcome to Cooperative Gig Services! 🤝",
      message: "Your bookings directly support certified skilled workers with fair wages and social security.",
      type: "system",
    });

    console.log("✅ Database successfully seeded with Federation, Cooperatives, Services, Workers, and Sample History!");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
  }
};
