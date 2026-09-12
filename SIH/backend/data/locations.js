/**
 * Location and Agro-Meteorological Database for Odisha Districts & Blocks
 * Prototype Mock Layer with realistic meteorological values
 */

const locations = [
  // Kendrapara District (Coastal Agro-Zone)
  {
    id: "od-kendrapara-rajkanika",
    state: "Odisha",
    district: "Kendrapara",
    block: "Rajkanika",
    panchayats: [
      "Dangarpatna", "Katana", "Barunadiha", "Meghapur", 
      "Baghabuda", "Tarasahi", "Jaynagar", "Nanpur", "Jagulaipada"
    ],
    coordinates: { lat: 20.712, lon: 86.784 },
    elevation_m: 12,
    agro_zone: "East & South Eastern Coastal Plain (Zone 11)",
    soil_type: "Coastal Alluvial & Saline Marshy",
    metrics: {
      temperature_c: 34.2,
      humidity_percent: 65.0,
      rainfall_24h_mm: 2.4,
      rainfall_15d_cumulative_mm: 32.0,
      rainfall_anomaly_percent: -24.0,
      soil_moisture_level: "Low",
      soil_moisture_fraction: 0.22,
      expected_rainfall_7d: 54.0,
      expected_rainfall_14d: 112.0,
      expected_rainfall_21d: 141.0,
      expected_rainfall_30d: 163.0,
      onset_probability: 0.76,
      break_probability: 0.68,
      heavy_rain_probability: 0.29,
      confidence: 0.81,
      dominant_risk: "HIGH",
      risk_factor: "Extended Dry Spell during Early Crop Establishment"
    }
  },
  {
    id: "od-kendrapara-aul",
    state: "Odisha",
    district: "Kendrapara",
    block: "Aul",
    panchayats: ["Demal", "Govindpur", "Batipada", "Keredagarh", "Sanmangala"],
    coordinates: { lat: 20.674, lon: 86.643 },
    elevation_m: 15,
    agro_zone: "Coastal Plain Zone",
    soil_type: "Deltaic Alluvial",
    metrics: {
      temperature_c: 33.8,
      humidity_percent: 68.0,
      rainfall_24h_mm: 5.1,
      rainfall_15d_cumulative_mm: 41.0,
      rainfall_anomaly_percent: -16.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.31,
      expected_rainfall_7d: 48.0,
      expected_rainfall_14d: 98.0,
      expected_rainfall_21d: 135.0,
      expected_rainfall_30d: 172.0,
      onset_probability: 0.72,
      break_probability: 0.54,
      heavy_rain_probability: 0.33,
      confidence: 0.74,
      dominant_risk: "MODERATE",
      risk_factor: "Sub-normal rainfall progression with intermittent showers"
    }
  },
  {
    id: "od-kendrapara-mahakalapada",
    state: "Odisha",
    district: "Kendrapara",
    block: "Mahakalapada",
    panchayats: ["Ramnagar", "Jambu", "Batighar", "Kharinasi", "Barada"],
    coordinates: { lat: 20.428, lon: 86.685 },
    elevation_m: 8,
    agro_zone: "Coastal Mangrove & Deltaic",
    soil_type: "Coastal Saline Clay",
    metrics: {
      temperature_c: 32.5,
      humidity_percent: 82.0,
      rainfall_24h_mm: 22.0,
      rainfall_15d_cumulative_mm: 78.0,
      rainfall_anomaly_percent: 18.0,
      soil_moisture_level: "High",
      soil_moisture_fraction: 0.44,
      expected_rainfall_7d: 88.0,
      expected_rainfall_14d: 165.0,
      expected_rainfall_21d: 215.0,
      expected_rainfall_30d: 280.0,
      onset_probability: 0.88,
      break_probability: 0.22,
      heavy_rain_probability: 0.68,
      confidence: 0.84,
      dominant_risk: "HIGH",
      risk_factor: "Heavy Inundation & Coastal Drainage Congestion"
    }
  },
  {
    id: "od-kendrapara-pattamundai",
    state: "Odisha",
    district: "Kendrapara",
    block: "Pattamundai",
    panchayats: ["Andhara", "Bachharai", "Alapua", "Dosia", "Srirampur"],
    coordinates: { lat: 20.573, lon: 86.568 },
    elevation_m: 14,
    agro_zone: "Coastal Plain Zone",
    soil_type: "Alluvial Clay Loam",
    metrics: {
      temperature_c: 33.5,
      humidity_percent: 71.0,
      rainfall_24h_mm: 4.8,
      rainfall_15d_cumulative_mm: 46.0,
      rainfall_anomaly_percent: -10.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.33,
      expected_rainfall_7d: 58.0,
      expected_rainfall_14d: 118.0,
      expected_rainfall_21d: 160.0,
      expected_rainfall_30d: 205.0,
      onset_probability: 0.79,
      break_probability: 0.41,
      heavy_rain_probability: 0.38,
      confidence: 0.79,
      dominant_risk: "MODERATE",
      risk_factor: "Normal onset with mid-season dry interval watch"
    }
  },
  {
    id: "od-kendrapara-marshaghai",
    state: "Odisha",
    district: "Kendrapara",
    block: "Marshaghai",
    panchayats: ["Berhampur", "Karatutha", "Dumuka", "Manikunda"],
    coordinates: { lat: 20.463, lon: 86.512 },
    elevation_m: 11,
    agro_zone: "Coastal Plain",
    soil_type: "Fine Alluvial",
    metrics: {
      temperature_c: 33.0,
      humidity_percent: 74.0,
      rainfall_24h_mm: 12.0,
      rainfall_15d_cumulative_mm: 62.0,
      rainfall_anomaly_percent: 4.0,
      soil_moisture_level: "High",
      soil_moisture_fraction: 0.39,
      expected_rainfall_7d: 64.0,
      expected_rainfall_14d: 132.0,
      expected_rainfall_21d: 180.0,
      expected_rainfall_30d: 230.0,
      onset_probability: 0.84,
      break_probability: 0.28,
      heavy_rain_probability: 0.45,
      confidence: 0.82,
      dominant_risk: "LOW",
      risk_factor: "Favorable Sowing Window with Stable Moisture"
    }
  },

  // Cuttack District
  {
    id: "od-cuttack-sadar",
    state: "Odisha",
    district: "Cuttack",
    block: "Cuttack Sadar",
    panchayats: ["Telengapentha", "Kalyani Nagar", "Bandalo", "Bidyadharpur"],
    coordinates: { lat: 20.462, lon: 85.883 },
    elevation_m: 36,
    agro_zone: "Central Alluvial Plateau & Plain",
    soil_type: "Riverine Alluvial",
    metrics: {
      temperature_c: 34.8,
      humidity_percent: 63.0,
      rainfall_24h_mm: 0.0,
      rainfall_15d_cumulative_mm: 28.0,
      rainfall_anomaly_percent: -32.0,
      soil_moisture_level: "Low",
      soil_moisture_fraction: 0.20,
      expected_rainfall_7d: 38.0,
      expected_rainfall_14d: 82.0,
      expected_rainfall_21d: 118.0,
      expected_rainfall_30d: 148.0,
      onset_probability: 0.69,
      break_probability: 0.72,
      heavy_rain_probability: 0.21,
      confidence: 0.78,
      dominant_risk: "HIGH",
      risk_factor: "Severe Dry Spell & Topsoil Desiccation Risk"
    }
  },
  {
    id: "od-cuttack-athagarh",
    state: "Odisha",
    district: "Cuttack",
    block: "Athagarh",
    panchayats: ["Radhakishorepur", "Khuntuni", "Dorada", "Kandarapur"],
    coordinates: { lat: 20.531, lon: 85.625 },
    elevation_m: 55,
    agro_zone: "Mid Central Table Land",
    soil_type: "Red & Laterite Loam",
    metrics: {
      temperature_c: 35.4,
      humidity_percent: 59.0,
      rainfall_24h_mm: 0.0,
      rainfall_15d_cumulative_mm: 22.0,
      rainfall_anomaly_percent: -38.0,
      soil_moisture_level: "Low",
      soil_moisture_fraction: 0.18,
      expected_rainfall_7d: 32.0,
      expected_rainfall_14d: 74.0,
      expected_rainfall_21d: 106.0,
      expected_rainfall_30d: 136.0,
      onset_probability: 0.64,
      break_probability: 0.75,
      heavy_rain_probability: 0.18,
      confidence: 0.76,
      dominant_risk: "VERY HIGH",
      risk_factor: "Critical Moisture Stress for Upland Sowing"
    }
  },
  {
    id: "od-cuttack-salipur",
    state: "Odisha",
    district: "Cuttack",
    block: "Salipur",
    panchayats: ["Bhatapada", "Choudwar", "Kishorenagar", "Sisua"],
    coordinates: { lat: 20.485, lon: 86.012 },
    elevation_m: 30,
    agro_zone: "Central Plain",
    soil_type: "Alluvial Loam",
    metrics: {
      temperature_c: 34.0,
      humidity_percent: 67.0,
      rainfall_24h_mm: 3.2,
      rainfall_15d_cumulative_mm: 38.0,
      rainfall_anomaly_percent: -18.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.28,
      expected_rainfall_7d: 46.0,
      expected_rainfall_14d: 96.0,
      expected_rainfall_21d: 138.0,
      expected_rainfall_30d: 180.0,
      onset_probability: 0.74,
      break_probability: 0.58,
      heavy_rain_probability: 0.28,
      confidence: 0.77,
      dominant_risk: "MODERATE",
      risk_factor: "Mild dry spell during nursery germination"
    }
  },

  // Puri District
  {
    id: "od-puri-sadar",
    state: "Odisha",
    district: "Puri",
    block: "Puri Sadar",
    panchayats: ["Baliguali", "Chhaitana", "Gopinathpur", "Samanga"],
    coordinates: { lat: 19.813, lon: 85.831 },
    elevation_m: 6,
    agro_zone: "Coastal Sand Dune & Deltaic",
    soil_type: "Coastal Sandy Alluvial",
    metrics: {
      temperature_c: 32.8,
      humidity_percent: 79.0,
      rainfall_24h_mm: 14.5,
      rainfall_15d_cumulative_mm: 68.0,
      rainfall_anomaly_percent: 6.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.34,
      expected_rainfall_7d: 68.0,
      expected_rainfall_14d: 142.0,
      expected_rainfall_21d: 196.0,
      expected_rainfall_30d: 252.0,
      onset_probability: 0.86,
      break_probability: 0.26,
      heavy_rain_probability: 0.52,
      confidence: 0.83,
      dominant_risk: "LOW",
      risk_factor: "Favorable Onset Progression with Adequate Sea-Breeze Influx"
    }
  },
  {
    id: "od-puri-nimapada",
    state: "Odisha",
    district: "Puri",
    block: "Nimapada",
    panchayats: ["Alipingal", "Denuan", "Gopabandhu", "Terundia"],
    coordinates: { lat: 20.061, lon: 86.015 },
    elevation_m: 14,
    agro_zone: "Coastal Deltaic",
    soil_type: "Alluvial Clay Loam",
    metrics: {
      temperature_c: 33.2,
      humidity_percent: 72.0,
      rainfall_24h_mm: 8.0,
      rainfall_15d_cumulative_mm: 52.0,
      rainfall_anomaly_percent: -4.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.32,
      expected_rainfall_7d: 56.0,
      expected_rainfall_14d: 116.0,
      expected_rainfall_21d: 162.0,
      expected_rainfall_30d: 210.0,
      onset_probability: 0.81,
      break_probability: 0.38,
      heavy_rain_probability: 0.36,
      confidence: 0.80,
      dominant_risk: "MODERATE",
      risk_factor: "Watch for intermittent 4-day dry pocket in week 2"
    }
  },

  // Khordha District
  {
    id: "od-khordha-bhubaneswar",
    state: "Odisha",
    district: "Khordha",
    block: "Bhubaneswar",
    panchayats: ["Patia", "Mencheswar", "Baramunda", "Tamando", "Dhauli"],
    coordinates: { lat: 20.296, lon: 85.824 },
    elevation_m: 45,
    agro_zone: "East Coast Uplands & Laterite Plain",
    soil_type: "Lateritic Loamy Sand",
    metrics: {
      temperature_c: 34.6,
      humidity_percent: 64.0,
      rainfall_24h_mm: 1.5,
      rainfall_15d_cumulative_mm: 31.0,
      rainfall_anomaly_percent: -26.0,
      soil_moisture_level: "Low",
      soil_moisture_fraction: 0.21,
      expected_rainfall_7d: 42.0,
      expected_rainfall_14d: 88.0,
      expected_rainfall_21d: 126.0,
      expected_rainfall_30d: 158.0,
      onset_probability: 0.71,
      break_probability: 0.65,
      heavy_rain_probability: 0.24,
      confidence: 0.79,
      dominant_risk: "HIGH",
      risk_factor: "Dry Spell Risk with Rapid Soil Moisture Depletion"
    }
  },
  {
    id: "od-khordha-jatani",
    state: "Odisha",
    district: "Khordha",
    block: "Jatani",
    panchayats: ["Kantabad", "Khurdha Road", "Kudiary", "Padanpur"],
    coordinates: { lat: 20.165, lon: 85.704 },
    elevation_m: 52,
    agro_zone: "Laterite Belt",
    soil_type: "Red Laterite",
    metrics: {
      temperature_c: 34.9,
      humidity_percent: 61.0,
      rainfall_24h_mm: 0.0,
      rainfall_15d_cumulative_mm: 26.0,
      rainfall_anomaly_percent: -34.0,
      soil_moisture_level: "Low",
      soil_moisture_fraction: 0.19,
      expected_rainfall_7d: 36.0,
      expected_rainfall_14d: 78.0,
      expected_rainfall_21d: 114.0,
      expected_rainfall_30d: 144.0,
      onset_probability: 0.67,
      break_probability: 0.71,
      heavy_rain_probability: 0.20,
      confidence: 0.77,
      dominant_risk: "HIGH",
      risk_factor: "Prolonged Dry Period in 8-15 Day Window"
    }
  },

  // Jagatsinghpur District
  {
    id: "od-jagatsinghpur-sadar",
    state: "Odisha",
    district: "Jagatsinghpur",
    block: "Jagatsinghpur Sadar",
    panchayats: ["Kaduapada", "Chatra", "Puran", "Alipingal"],
    coordinates: { lat: 20.258, lon: 86.171 },
    elevation_m: 16,
    agro_zone: "Coastal Plain",
    soil_type: "Deltaic Clay Loam",
    metrics: {
      temperature_c: 33.4,
      humidity_percent: 73.0,
      rainfall_24h_mm: 7.4,
      rainfall_15d_cumulative_mm: 54.0,
      rainfall_anomaly_percent: -2.0,
      soil_moisture_level: "Moderate",
      soil_moisture_fraction: 0.35,
      expected_rainfall_7d: 59.0,
      expected_rainfall_14d: 124.0,
      expected_rainfall_21d: 172.0,
      expected_rainfall_30d: 220.0,
      onset_probability: 0.83,
      break_probability: 0.35,
      heavy_rain_probability: 0.42,
      confidence: 0.81,
      dominant_risk: "LOW",
      risk_factor: "Balanced Moisture Conditions"
    }
  },
  {
    id: "od-jagatsinghpur-paradip",
    state: "Odisha",
    district: "Jagatsinghpur",
    block: "Paradip (Kujang)",
    panchayats: ["Bhutamundai", "Nuagarh", "Sandhakuda", "Bijaychandrapur"],
    coordinates: { lat: 20.298, lon: 86.666 },
    elevation_m: 4,
    agro_zone: "Coastal Littoral",
    soil_type: "Saline Sandy Marshy",
    metrics: {
      temperature_c: 32.1,
      humidity_percent: 84.0,
      rainfall_24h_mm: 19.8,
      rainfall_15d_cumulative_mm: 82.0,
      rainfall_anomaly_percent: 22.0,
      soil_moisture_level: "High",
      soil_moisture_fraction: 0.46,
      expected_rainfall_7d: 92.0,
      expected_rainfall_14d: 178.0,
      expected_rainfall_21d: 234.0,
      expected_rainfall_30d: 295.0,
      onset_probability: 0.89,
      break_probability: 0.19,
      heavy_rain_probability: 0.72,
      confidence: 0.85,
      dominant_risk: "VERY HIGH",
      risk_factor: "Heavy Inundation & Waterlogging in Low-Lying Tracts"
    }
  },

  // Balasore District
  {
    id: "od-balasore-sadar",
    state: "Odisha",
    district: "Balasore",
    block: "Balasore Sadar",
    panchayats: ["Kuruda", "Haladipada", "Chhanpur", "Srikona", "Phulwar", "Rundia", "Remuna Ghati", "Kasipada"],
    coordinates: { lat: 21.493, lon: 86.932 },
    elevation_m: 18,
    agro_zone: "North Eastern Coastal Plain",
    soil_type: "Coastal Sandy Alluvium",
    metrics: {
      temperature_c: 33.6, humidity_percent: 70.0, rainfall_24h_mm: 6.2, rainfall_15d_cumulative_mm: 48.0,
      rainfall_anomaly_percent: -8.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.30,
      expected_rainfall_7d: 52.0, expected_rainfall_14d: 110.0, expected_rainfall_21d: 155.0, expected_rainfall_30d: 198.0,
      onset_probability: 0.78, break_probability: 0.45, heavy_rain_probability: 0.35, confidence: 0.80, dominant_risk: "MODERATE", risk_factor: "Moderate Dry Spell Risk in week 3"
    }
  },
  {
    id: "od-balasore-jaleswar",
    state: "Odisha",
    district: "Balasore",
    block: "Jaleswar",
    panchayats: ["Sugo", "Kotasahi", "Rayaramchandrapur", "Paschimbad", "Arakhpur", "Netua", "Paikasa", "Champavar", "Khalina", "Olada", "Laxmannath", "Jaleswar Town"],
    coordinates: { lat: 21.802, lon: 87.214 },
    elevation_m: 22,
    agro_zone: "Subarnarekha Deltaic Basin",
    soil_type: "River Alluvium",
    metrics: {
      temperature_c: 33.1, humidity_percent: 75.0, rainfall_24h_mm: 11.0, rainfall_15d_cumulative_mm: 64.0,
      rainfall_anomaly_percent: 8.0, soil_moisture_level: "High", soil_moisture_fraction: 0.38,
      expected_rainfall_7d: 70.0, expected_rainfall_14d: 145.0, expected_rainfall_21d: 195.0, expected_rainfall_30d: 245.0,
      onset_probability: 0.85, break_probability: 0.25, heavy_rain_probability: 0.55, confidence: 0.82, dominant_risk: "LOW", risk_factor: "Favorable Onset with Adequate Surface Runoff"
    }
  },
  {
    id: "od-balasore-baliapal",
    state: "Odisha",
    district: "Balasore",
    block: "Baliapal",
    panchayats: ["Baliapal", "Asti", "Badasimulia", "Badhapal", "Bishnupur", "Dalua", "Ghantiary", "Jamkunda", "Jharapimpal", "Panchurukhi", "Paschima Bad", "Rella"],
    coordinates: { lat: 21.661, lon: 87.288 },
    elevation_m: 12,
    agro_zone: "Subarnarekha Estuarine Coastal",
    soil_type: "Coastal Alluvial & Saline",
    metrics: {
      temperature_c: 32.8, humidity_percent: 78.0, rainfall_24h_mm: 14.2, rainfall_15d_cumulative_mm: 72.0,
      rainfall_anomaly_percent: 12.0, soil_moisture_level: "High", soil_moisture_fraction: 0.42,
      expected_rainfall_7d: 76.0, expected_rainfall_14d: 152.0, expected_rainfall_21d: 204.0, expected_rainfall_30d: 260.0,
      onset_probability: 0.87, break_probability: 0.22, heavy_rain_probability: 0.60, confidence: 0.84, dominant_risk: "MODERATE", risk_factor: "Estuarine Tidal Drainage Congestion"
    }
  },
  {
    id: "od-balasore-basta",
    state: "Odisha",
    district: "Balasore",
    block: "Basta",
    panchayats: ["Basta", "Darda", "Mukulisi", "Sadanandapur", "Mathani", "Baharda", "Nagra", "Brahmanagao"],
    coordinates: { lat: 21.698, lon: 87.054 },
    elevation_m: 16,
    agro_zone: "North Eastern Coastal Plain",
    soil_type: "Alluvial Clay Loam",
    metrics: {
      temperature_c: 33.3, humidity_percent: 72.0, rainfall_24h_mm: 8.5, rainfall_15d_cumulative_mm: 58.0,
      rainfall_anomaly_percent: 2.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.34,
      expected_rainfall_7d: 62.0, expected_rainfall_14d: 128.0, expected_rainfall_21d: 174.0, expected_rainfall_30d: 222.0,
      onset_probability: 0.81, break_probability: 0.32, heavy_rain_probability: 0.44, confidence: 0.81, dominant_risk: "LOW", risk_factor: "Normal Monsoon Progression"
    }
  },
  {
    id: "od-balasore-bhograi",
    state: "Odisha",
    district: "Balasore",
    block: "Bhograi",
    panchayats: ["Bhograi", "Chandanpur", "Kusha", "Talsari", "Batagram", "Dehurda", "Kamarda", "Sarasatia"],
    coordinates: { lat: 21.654, lon: 87.382 },
    elevation_m: 8,
    agro_zone: "Coastal Bay Belt",
    soil_type: "Coastal Sand & Saline Clay",
    metrics: {
      temperature_c: 32.4, humidity_percent: 81.0, rainfall_24h_mm: 18.0, rainfall_15d_cumulative_mm: 84.0,
      rainfall_anomaly_percent: 20.0, soil_moisture_level: "High", soil_moisture_fraction: 0.45,
      expected_rainfall_7d: 88.0, expected_rainfall_14d: 168.0, expected_rainfall_21d: 220.0, expected_rainfall_30d: 285.0,
      onset_probability: 0.89, break_probability: 0.18, heavy_rain_probability: 0.68, confidence: 0.85, dominant_risk: "HIGH", risk_factor: "Heavy Coastal Precipitation & Inundation Watch"
    }
  },
  {
    id: "od-balasore-remuna",
    state: "Odisha",
    district: "Balasore",
    block: "Remuna",
    panchayats: ["Remuna", "Gopalpur", "Kalyani", "Patripada", "Nisamani", "Mandarpur", "Sujanpur", "Padmapur"],
    coordinates: { lat: 21.528, lon: 86.874 },
    elevation_m: 20,
    agro_zone: "Foothill Coastal Zone",
    soil_type: "Alluvial Sandy Clay",
    metrics: {
      temperature_c: 33.5, humidity_percent: 69.0, rainfall_24h_mm: 5.4, rainfall_15d_cumulative_mm: 45.0,
      rainfall_anomaly_percent: -12.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.28,
      expected_rainfall_7d: 50.0, expected_rainfall_14d: 106.0, expected_rainfall_21d: 148.0, expected_rainfall_30d: 190.0,
      onset_probability: 0.77, break_probability: 0.48, heavy_rain_probability: 0.32, confidence: 0.79, dominant_risk: "MODERATE", risk_factor: "Intermittent mid-season dry spells"
    }
  },

  // Bhadrak District
  {
    id: "od-bhadrak-sadar",
    state: "Odisha",
    district: "Bhadrak",
    block: "Bhadrak Sadar",
    panchayats: ["Arnapal", "Kharida", "Randia", "Banta", "Gelpur", "Baudpur", "Asura", "Nalanga"],
    coordinates: { lat: 21.058, lon: 86.512 },
    elevation_m: 23,
    agro_zone: "North Eastern Coastal Plain",
    soil_type: "Alluvial Clay Loam",
    metrics: {
      temperature_c: 33.9, humidity_percent: 68.0, rainfall_24h_mm: 3.8, rainfall_15d_cumulative_mm: 39.0,
      rainfall_anomaly_percent: -19.0, soil_moisture_level: "Low", soil_moisture_fraction: 0.24,
      expected_rainfall_7d: 47.0, expected_rainfall_14d: 99.0, expected_rainfall_21d: 140.0, expected_rainfall_30d: 178.0,
      onset_probability: 0.74, break_probability: 0.62, heavy_rain_probability: 0.27, confidence: 0.78, dominant_risk: "HIGH", risk_factor: "Dry Spell Risk with Low Germination Moisture"
    }
  },
  {
    id: "od-bhadrak-chandbali",
    state: "Odisha",
    district: "Bhadrak",
    block: "Chandbali",
    panchayats: ["Motto", "Kandagaradi", "Aradi", "Bansada", "Dhamra", "Panchapada", "Karanjamal", "Orasahi"],
    coordinates: { lat: 20.784, lon: 86.745 },
    elevation_m: 9,
    agro_zone: "Baitarani Estuarine Delta",
    soil_type: "Saline Alluvial",
    metrics: {
      temperature_c: 33.0, humidity_percent: 78.0, rainfall_24h_mm: 15.0, rainfall_15d_cumulative_mm: 72.0,
      rainfall_anomaly_percent: 12.0, soil_moisture_level: "High", soil_moisture_fraction: 0.41,
      expected_rainfall_7d: 78.0, expected_rainfall_14d: 155.0, expected_rainfall_21d: 208.0, expected_rainfall_30d: 265.0,
      onset_probability: 0.86, break_probability: 0.24, heavy_rain_probability: 0.61, confidence: 0.83, dominant_risk: "HIGH", risk_factor: "High Heavy Rainfall & Waterlogging Probability"
    }
  },
  {
    id: "od-bhadrak-dhamnagar",
    state: "Odisha",
    district: "Bhadrak",
    block: "Dhamnagar",
    panchayats: ["Dhamnagar", "Dobal", "Jahangir", "Asurali", "Kothar", "Khaparapada", "Chudamani"],
    coordinates: { lat: 20.912, lon: 86.442 },
    elevation_m: 18,
    agro_zone: "Central Coastal Basin",
    soil_type: "Clay Alluvium",
    metrics: {
      temperature_c: 33.7, humidity_percent: 71.0, rainfall_24h_mm: 6.8, rainfall_15d_cumulative_mm: 48.0,
      rainfall_anomaly_percent: -6.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.31,
      expected_rainfall_7d: 55.0, expected_rainfall_14d: 114.0, expected_rainfall_21d: 158.0, expected_rainfall_30d: 202.0,
      onset_probability: 0.79, break_probability: 0.39, heavy_rain_probability: 0.38, confidence: 0.80, dominant_risk: "MODERATE", risk_factor: "Normal Onset"
    }
  },

  // Ganjam District (Southern Odisha)
  {
    id: "od-ganjam-berhampur",
    state: "Odisha",
    district: "Ganjam",
    block: "Berhampur",
    panchayats: ["Ankushpur", "Lathi", "Nimakhandi", "Golanthara", "Haladiapadar", "Kukudakhandi", "Brahmapur Town", "Bhakuri"],
    coordinates: { lat: 19.315, lon: 84.794 },
    elevation_m: 27,
    agro_zone: "East Coast Southern Plain",
    soil_type: "Red Sandy Loam",
    metrics: {
      temperature_c: 34.4, humidity_percent: 66.0, rainfall_24h_mm: 1.0, rainfall_15d_cumulative_mm: 34.0,
      rainfall_anomaly_percent: -22.0, soil_moisture_level: "Low", soil_moisture_fraction: 0.23,
      expected_rainfall_7d: 44.0, expected_rainfall_14d: 92.0, expected_rainfall_21d: 130.0, expected_rainfall_30d: 165.0,
      onset_probability: 0.73, break_probability: 0.64, heavy_rain_probability: 0.26, confidence: 0.79, dominant_risk: "HIGH", risk_factor: "Rainfall deficit during direct seedling emergence"
    }
  },
  {
    id: "od-ganjam-chatrapur",
    state: "Odisha",
    district: "Ganjam",
    block: "Chatrapur",
    panchayats: ["Chatrapur", "Agastinuagaon", "Aryapalli", "Bipulingi", "Ganjam Town", "Kanamana", "Chamaakhandi"],
    coordinates: { lat: 19.354, lon: 84.988 },
    elevation_m: 14,
    agro_zone: "East Coast Littoral",
    soil_type: "Coastal Sand & Sandy Loam",
    metrics: {
      temperature_c: 33.6, humidity_percent: 74.0, rainfall_24h_mm: 5.2, rainfall_15d_cumulative_mm: 42.0,
      rainfall_anomaly_percent: -10.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.29,
      expected_rainfall_7d: 52.0, expected_rainfall_14d: 108.0, expected_rainfall_21d: 148.0, expected_rainfall_30d: 188.0,
      onset_probability: 0.78, break_probability: 0.44, heavy_rain_probability: 0.36, confidence: 0.81, dominant_risk: "MODERATE", risk_factor: "Coastal sea breeze moisture flux"
    }
  },

  // Mayurbhanj District (Northern Plateau)
  {
    id: "od-mayurbhanj-baripada",
    state: "Odisha",
    district: "Mayurbhanj",
    block: "Baripada",
    panchayats: ["Pundal", "Sankhabhanga", "Manitri", "Badasahi", "Lalazar", "Deuli", "Bhaunri", "Takatpur"],
    coordinates: { lat: 21.933, lon: 86.737 },
    elevation_m: 88,
    agro_zone: "North Central Plateau (Similipal Foothills)",
    soil_type: "Red Laterite & Gravelly Loam",
    metrics: {
      temperature_c: 35.1, humidity_percent: 60.0, rainfall_24h_mm: 0.0, rainfall_15d_cumulative_mm: 25.0,
      rainfall_anomaly_percent: -36.0, soil_moisture_level: "Low", soil_moisture_fraction: 0.17,
      expected_rainfall_7d: 34.0, expected_rainfall_14d: 76.0, expected_rainfall_21d: 110.0, expected_rainfall_30d: 140.0,
      onset_probability: 0.66, break_probability: 0.74, heavy_rain_probability: 0.19, confidence: 0.77, dominant_risk: "VERY HIGH", risk_factor: "Severe Upland Soil Moisture Deficit"
    }
  },

  // Jajpur District
  {
    id: "od-jajpur-sadar",
    state: "Odisha",
    district: "Jajpur",
    block: "Jajpur Sadar",
    panchayats: ["Bari", "Binjharpur", "Dharmasala", "Sukinda", "Kalinganagar", "Vyasanagar", "Korei", "Rasulpur"],
    coordinates: { lat: 20.852, lon: 86.334 },
    elevation_m: 35,
    agro_zone: "Mid Central Plain",
    soil_type: "Alluvial Clay Loam",
    metrics: {
      temperature_c: 34.1, humidity_percent: 66.0, rainfall_24h_mm: 4.0, rainfall_15d_cumulative_mm: 36.0,
      rainfall_anomaly_percent: -20.0, soil_moisture_level: "Moderate", soil_moisture_fraction: 0.26,
      expected_rainfall_7d: 49.0, expected_rainfall_14d: 104.0, expected_rainfall_21d: 146.0, expected_rainfall_30d: 185.0,
      onset_probability: 0.75, break_probability: 0.59, heavy_rain_probability: 0.30, confidence: 0.78, dominant_risk: "MODERATE", risk_factor: "Intermittent dry periods requiring protective irrigation"
    }
  }
];

// Helper functions for locations
const getDistricts = () => {
  const uniqueDistricts = [...new Set(locations.map(l => l.district))];
  return uniqueDistricts.sort();
};

const getBlocksByDistrict = (districtName) => {
  return locations.filter(l => l.district.toLowerCase() === districtName.toLowerCase());
};

const getLocationById = (id) => {
  return locations.find(l => l.id.toLowerCase() === id.toLowerCase()) || locations[0];
};

const findLocation = (district, block) => {
  const match = locations.find(
    l => l.district.toLowerCase() === (district || "").toLowerCase() &&
         l.block.toLowerCase() === (block || "").toLowerCase()
  );
  return match || locations[0]; // defaults to Rajkanika
};

export {
  locations,
  getDistricts,
  getBlocksByDistrict,
  getLocationById,
  findLocation
};

