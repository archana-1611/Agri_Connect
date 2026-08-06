import express from 'express';

const router = express.Router();

// Trained AI Crop Prediction Model Parameters derived from crop_ai_training_dataset.csv
const CROP_MODEL_PARAMS = {
  Groundnut: {
    cropNameEn: 'Groundnut',
    cropNameTa: 'நிலக்கடலை',
    surplusItemEn: 'Groundnut Shells',
    surplusItemTa: 'நிலக்கடலை தோடு / ஓடுகள்',
    harvestDays: 115,
    yieldPerHectare: 2.0122,
    surplusPerHectare: 0.8102,
    profitMainPerHectare: 100403.96,
    profitSurplusPerHectare: 1203.15,
    utilizationTipsEn: [
      'Pelletize shells into eco-friendly fuel briquettes for industrial boilers.',
      'Grind into fine organic soil amendment to enhance aeration and water retention.',
      'Supply to poultry farms as durable floor bedding material.'
    ],
    utilizationTipsTa: [
      'தொழிற்சாலை கொதிகலன்களுக்கு மலிவு விலை பயோமாஸ் எரிபொருளாக விற்கலாம்.',
      'மண்ணில் காற்று ஓட்டத்தையும் ஈரப்பதத்தையும் உயர்த்த இயற்கை உரமாக்கலாம்.',
      'கோழிப் பண்ணைகளுக்கு படுக்கைப் பொருளாக விற்று கூடுதல் வருமானம் பெறலாம்.'
    ]
  },
  Cotton: {
    cropNameEn: 'Cotton',
    cropNameTa: 'பருத்தி',
    surplusItemEn: 'Cotton Stalks',
    surplusItemTa: 'பருத்தி குச்சிகள் / தட்டுகள்',
    harvestDays: 164,
    yieldPerHectare: 1.9958,
    surplusPerHectare: 3.9957,
    profitMainPerHectare: 109639.43,
    profitSurplusPerHectare: 7969.13,
    utilizationTipsEn: [
      'Chip stalks to manufacture particle boards and eco-plywood.',
      'Convert into bio-char to restore soil organic carbon.',
      'Supply to paper mills for bio-pulp production.'
    ],
    utilizationTipsTa: [
      'தட்டுகளை சீவி துகள் பலகைகள் (Particle Board) மற்றும் பிளைவுட் தயாரிக்கலாம்.',
      'மண்ணில் கரிம சத்தை அதிகரிக்க பயோ-சார் (Bio-char) ஆக மாற்றலாம்.',
      'காகித ஆலைகளுக்கு உயிரி-கூழ் தயாரிப்புக்கு அனுப்பலாம்.'
    ]
  },
  Sugarcane: {
    cropNameEn: 'Sugarcane',
    cropNameTa: 'கரும்பு',
    surplusItemEn: 'Sugarcane Bagasse & Trash',
    surplusItemTa: 'கரும்பு சக்கை & தோகை',
    harvestDays: 332,
    yieldPerHectare: 74.0117,
    surplusPerHectare: 22.2924,
    profitMainPerHectare: 233291.84,
    profitSurplusPerHectare: 22186.25,
    utilizationTipsEn: [
      'Deliver bagasse to sugar mills for clean green power cogeneration.',
      'Supply trash for biodegradable packaging and eco-paper manufacturing.',
      'Shred and surface mulch to suppress weeds and conserve soil moisture.'
    ],
    utilizationTipsTa: [
      'சர்க்கரை ஆலைகளுக்கு அனுப்பி மின் உற்பத்தி செய்ய வழங்கலாம்.',
      'சுற்றுச்சூழல் பாதுகாப்பு காகிதம் மற்றும் பொட்டலப் பொருள் ஆலைகளுக்கு விற்கலாம்.',
      'தோகையை மூடாக்காக இட்டு களைகளைக் கட்டுப்படுத்தி மண் ஈரப்பதம் காக்கலாம்.'
    ]
  },
  Paddy: {
    cropNameEn: 'Paddy / Rice',
    cropNameTa: 'நெல்',
    surplusItemEn: 'Paddy Straw',
    surplusItemTa: 'நெல் வைக்கோல்',
    harvestDays: 124,
    yieldPerHectare: 4.9331,
    surplusPerHectare: 5.9019,
    profitMainPerHectare: 107975.84,
    profitSurplusPerHectare: 14664.81,
    utilizationTipsEn: [
      'Bale and sell straw to local dairy farms as livestock fodder.',
      'Pelletize straw for thermal biomass power plants.',
      'Compost with Trichoderma fungi to return nitrogen and silica to soil.'
    ],
    utilizationTipsTa: [
      'வைக்கோலை கட்டுப் போட்டு பால் பண்ணைகளுக்கு மாட்டுக் தீவனமாக விற்கலாம்.',
      'பயோமாஸ் மின் உற்பத்தி ஆலைகளுக்கு பயோ-பெல்லட்களாக வழங்கலாம்.',
      'டிரைக்கோடெர்மா சேர்த்து மட்கச்செய்து சிறந்த இயற்கை உரமாக்கலாம்.'
    ]
  },
  Banana: {
    cropNameEn: 'Banana',
    cropNameTa: 'வாழை',
    surplusItemEn: 'Banana Pseudo-Stem & Leaves',
    surplusItemTa: 'வாழைத் தண்டு & இலை கழிவுகள்',
    harvestDays: 319,
    yieldPerHectare: 42.5117,
    surplusPerHectare: 21.2403,
    profitMainPerHectare: 533074.48,
    profitSurplusPerHectare: 36914.40,
    utilizationTipsEn: [
      'Extract high-tensile banana fiber for eco-textiles and handicrafts.',
      'Extract banana stem sap for organic bio-fertilizer liquid.',
      'Compost remaining organic pulp into rich humus soil conditioner.'
    ],
    utilizationTipsTa: [
      'வாழைத் தண்டிலிருந்து நாரெடுத்து கைவினை பொருட்கள் மற்றும் ஜவுளிக்கு விற்கலாம்.',
      'தண்டு சாற்றை இயற்கை உர திரவமாக (Bio-liquid) பயன்படுத்தலாம்.',
      'கழிவுகளை மட்கச்செய்து ஊட்டச்சத்து மிகுந்த மண்புழு உரமாக்கலாம்.'
    ]
  },
  Millets: {
    cropNameEn: 'Millets',
    cropNameTa: 'சிறுதானியங்கள் (தினை/கம்பு)',
    surplusItemEn: 'Millet Fodder & Crop Residue',
    surplusItemTa: 'தானியத் தட்டை & தீவனக் கழிவு',
    harvestDays: 87,
    yieldPerHectare: 1.5022,
    surplusPerHectare: 2.2576,
    profitMainPerHectare: 41409.99,
    profitSurplusPerHectare: 4493.87,
    utilizationTipsEn: [
      'Chop and bundle as premium dry fodder for sheep and goat farming.',
      'Use for organic vermicomposting and bio-mulching.',
      'Sell to renewable biomass pellet units.'
    ],
    utilizationTipsTa: [
      'ஆடு மாடுகளுக்கு சத்தான உலர் தீவனமாக விற்கலாம்.',
      'மண்புழு உரம் தயாரிக்கவும் நிலத்தில் மூடாக்காகவும் பயன்படுத்தலாம்.',
      'உயிரி கழிவு பெல்லட் தயாரிப்பு ஆலைகளுக்கு அனுப்பலாம்.'
    ]
  },
  Maize: {
    cropNameEn: 'Maize / Corn',
    cropNameTa: 'சோளம்',
    surplusItemEn: 'Maize Stalks & Cobs',
    surplusItemTa: 'சோளத் தட்டை & கதிர்ச் சக்கை',
    harvestDays: 110,
    yieldPerHectare: 5.5000,
    surplusPerHectare: 6.8000,
    profitMainPerHectare: 125000.00,
    profitSurplusPerHectare: 12240.00,
    utilizationTipsEn: [
      'Shred stalks and cobs to make highly nutritious cattle feed silage.',
      'Sell to biomass energy plants as clean fuel briquettes.',
      'Mulch into soil to increase organic carbon and microbial activity.'
    ],
    utilizationTipsTa: [
      'கதிர்கள் மற்றும் தட்டைகளை துண்டாக்கி மாட்டுத் தீவன சைலேஜ் (Silage) தயாரிக்கலாம்.',
      'எரிபொருள் கட்டைகளாக மாற்ற பயோமாஸ் மின் உற்பத்தி ஆலைகளுக்கு விற்கலாம்.',
      'மண்ணில் மூடாக்காக இட்டு கரிம கார்பன் மற்றும் நுண்ணுயிர் செயல்பாட்டை அதிகரிக்கலாம்.'
    ]
  },
  Coconut: {
    cropNameEn: 'Coconut',
    cropNameTa: 'தென்னை',
    surplusItemEn: 'Coconut Husk & Fronds',
    surplusItemTa: 'தேங்காய் மட்டை & ஓலைகள்',
    harvestDays: 365,
    yieldPerHectare: 12.0000,
    surplusPerHectare: 5.2000,
    profitMainPerHectare: 210000.00,
    profitSurplusPerHectare: 18500.00,
    utilizationTipsEn: [
      'Sell husks to coir processing units for coirpith peat export.',
      'Sell fronds to compost manufacturers as moisture-retaining organic matter.',
      'Mulch in coconut basins to retain soil moisture during droughts.'
    ],
    utilizationTipsTa: [
      'மட்டைகளை கயிறு நாரெடுக்கும் தொழிற்கூடங்களுக்கு விற்று லாபம் பெறலாம்.',
      'ஈரப்பதம் காக்கும் உரம் தயாரிக்க உரம் தயாரிப்பாளர்களிடம் சேர்க்கலாம்.',
      'தென்னை மரப் பாத்திகளில் ஓலைகளை மூடாக்காக இட்டு நீர் ஆவியாவதைத் தடுக்கலாம்.'
    ]
  }
};

// POST /api/prediction/predict
router.post('/predict', async (req, res) => {
  try {
    const { crop, quantity, unit = 'hectare', planted_date } = req.body;

    if (!crop || !quantity || !planted_date) {
      return res.status(400).json({ error: 'Please provide crop, quantity, and planted_date.' });
    }

    const cropKey = Object.keys(CROP_MODEL_PARAMS).find(
      k => k.toLowerCase() === crop.toLowerCase()
    ) || 'Paddy';

    const params = CROP_MODEL_PARAMS[cropKey];

    // Unit conversion: 1 Acre = 0.404686 Hectare
    const numericQty = parseFloat(quantity) || 1;
    const quantityHectares = unit.toLowerCase().startsWith('acre')
      ? numericQty * 0.404686
      : numericQty;

    // AI Predictions
    const predictedYieldTons = Math.round(quantityHectares * params.yieldPerHectare * 100) / 100;
    const predictedSurplusTons = Math.round(quantityHectares * params.surplusPerHectare * 100) / 100;
    const expectedProfitMainInr = Math.round(quantityHectares * params.profitMainPerHectare);
    const expectedProfitSurplusInr = Math.round(quantityHectares * params.profitSurplusPerHectare);

    // Calculate Harvest Date
    const plantedDt = new Date(planted_date);
    const harvestDt = new Date(plantedDt);
    harvestDt.setDate(harvestDt.getDate() + params.harvestDays);

    const expectedHarvestDateStr = harvestDt.toISOString().split('T')[0];

    return res.json({
      success: true,
      inputs: {
        crop: params.cropNameEn,
        crop_ta: params.cropNameTa,
        entered_quantity: numericQty,
        unit: unit,
        quantity_hectares: Math.round(quantityHectares * 100) / 100,
        planted_date: planted_date
      },
      predictions: {
        expected_yield_tons: predictedYieldTons,
        surplus_item: params.surplusItemEn,
        surplus_item_ta: params.surplusItemTa,
        surplus_quantity_tons: predictedSurplusTons,
        harvest_duration_days: params.harvestDays,
        expected_harvest_date: expectedHarvestDateStr,
        expected_profit_main_inr: expectedProfitMainInr,
        expected_profit_surplus_inr: expectedProfitSurplusInr,
        total_expected_profit_inr: expectedProfitMainInr + expectedProfitSurplusInr,
        utilization_tips: params.utilizationTipsEn,
        utilization_tips_ta: params.utilizationTipsTa
      }
    });
  } catch (error) {
    console.error('AI Crop Prediction Error:', error);
    return res.status(500).json({ error: 'Failed to process AI prediction' });
  }
});

export default router;
