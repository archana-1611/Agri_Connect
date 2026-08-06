export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'Farmer' | 'Buyer' | 'Trader' | 'Transport' | 'Expert' | 'Support';
  location: string;
  district: string;
  village: string;
  pincode: string;
  farm_name?: string;
  practices?: string;
}

export interface ResourceListing {
  id: string;
  title: string;
  titleTa: string;
  crop: string;
  category: string;
  quantity: string;
  price: number;
  location: string;
  district: string;
  village: string;
  pincode: string;
  description: string;
  descriptionTa: string;
  image_url: string;
  user_id: string;
  created_at: string;
}

export interface CropAIConsult {
  crop: string;
  cropTa: string;
  yieldPerAcre: string;
  yieldPerAcreTa: string;
  surplusResource: string;
  surplusResourceTa: string;
  quantityPredictRatio: number; // kg per acre
  pricePredictRatio: number; // ₹ per kg
  recyclingTip: string;
  recyclingTipTa: string;
  potentialBuyers: string[];
  potentialBuyersTa: string[];
}

export const DEMO_PROFILES: Record<string, Profile> = {
  Farmer: {
    id: 'demo-farmer-id',
    full_name: 'Karthik Raja',
    email: 'karthik.farmer@agriconnect.org',
    phone: '+91 94420 89201',
    role: 'Farmer',
    location: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    village: 'Pollachi',
    pincode: '642001',
    farm_name: 'Raja Organic Farms',
    practices: 'Mainly grows Paddy and Coconut. Focuses on organic soil rejuvenation and residue sale.'
  },
  Buyer: {
    id: 'demo-buyer-id',
    full_name: 'Annamalai Agri Traders',
    email: 'contact@annamalaitraders.in',
    phone: '+91 98456 12300',
    role: 'Buyer',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    village: 'Attur',
    pincode: '636102',
    farm_name: 'Annamalai Composting Ltd.',
    practices: 'Procurer of agricultural waste: paddy straw, sugarcane bagasse, and coconut husk for biomass fuel.'
  },
  Transport: {
    id: 'demo-transport-id',
    full_name: 'Vetri Bulk Freight',
    email: 'bookings@vetrilogistics.com',
    phone: '+91 94451 88921',
    role: 'Transport',
    location: 'Tiruppur, Tamil Nadu',
    district: 'Tiruppur',
    village: 'Palladam',
    pincode: '641664',
    farm_name: 'Vetri Logistics',
    practices: 'Operates 12 agricultural freight carriers. Specializes in hauling bulk straw and bagasse.'
  },
  Expert: {
    id: 'demo-expert-id',
    full_name: 'Dr. Selvam (TNAU)',
    email: 'selvam.prof@tnau.ac.in',
    phone: '+91 91522 77100',
    role: 'Expert',
    location: 'Madurai, Tamil Nadu',
    district: 'Madurai',
    village: 'Thirumangalam',
    pincode: '625706',
    farm_name: 'TNAU Extension Office',
    practices: 'Agronomy Professor and Bio-mass Consultant advising on crop rotation and green carbon offsets.'
  },
  Support: {
    id: 'demo-support-id',
    full_name: 'Agent Archana',
    email: 'support@agriconnect.org',
    phone: '+91 90000 00000',
    role: 'Support',
    location: 'Headquarters, Chennai',
    district: 'Chennai',
    village: 'Egmore',
    pincode: '600008',
    practices: 'AgriConnect support lead specializing in crop sourcing, logistics dispatch, and farmer outreach.'
  }
};

export const DEMO_RESOURCES: ResourceListing[] = [
  {
    id: 'res-1',
    title: 'Dry Paddy Straw Bales',
    titleTa: 'உலர் நெல் வைக்கோல் கட்டுகள்',
    crop: 'Paddy',
    category: 'crop residues',
    quantity: '1200 kg',
    price: 3600,
    location: 'Thanjavur, Tamil Nadu',
    district: 'Thanjavur',
    village: 'Orathanadu',
    pincode: '614625',
    description: 'Perfectly dried paddy straw in high density bales, stored in dry shed. Great for animal fodder.',
    descriptionTa: 'அடர்த்தியாகக் கட்டப்பட்ட உலர் நெல் வைக்கோல். கால்நடைத் தீவனத்திற்கு மிகவும் ஏற்றது.',
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=400',
    user_id: 'demo-farmer-id',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'res-2',
    title: 'Sugarcane Bagasse',
    titleTa: 'கரும்பு சக்கை (பாகாஸ்)',
    crop: 'Sugarcane',
    category: 'crop residues',
    quantity: '3000 kg',
    price: 9000,
    location: 'Erode, Tamil Nadu',
    district: 'Erode',
    village: 'Gobichettipalayam',
    pincode: '638452',
    description: 'Fresh bagasse from organic cane crush. Ideal for composting, paper manufacturing or biomass fuels.',
    descriptionTa: 'காகித ஆலைகள் அல்லது மட்கிய உரத் தயாரிப்பிற்கு ஏற்ற உயர்தர கரும்புச் சக்கை.',
    image_url: 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=400',
    user_id: 'res-user-2',
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: 'res-3',
    title: 'Fibrous Coconut Husk',
    titleTa: 'நார்ச்சத்து நிறைந்த தேங்காய் மட்டை',
    crop: 'Coconut',
    category: 'husk',
    quantity: '800 kg',
    price: 2400,
    location: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    village: 'Pollachi',
    pincode: '642001',
    description: 'Excellent moisture retention husks suitable for coir industries or horticultural mulching.',
    descriptionTa: 'தேங்காய் நார் தொழில்கள் மற்றும் தாவர வளர்ப்புப் பயன்பாடுகளுக்கு உகந்த உலர் மட்டைகள்.',
    image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400',
    user_id: 'demo-farmer-id',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
  },
  {
    id: 'res-4',
    title: 'Banana Pseudo-Stem Fibers',
    titleTa: 'வாழை தண்டு நார்கள்',
    crop: 'Banana',
    category: 'crop residues',
    quantity: '500 kg',
    price: 2500,
    location: 'Trichy, Tamil Nadu',
    district: 'Tiruchirappalli',
    village: 'Lalgudi',
    pincode: '621601',
    description: 'Harvested stems rich in organic fiber. Perfect for eco-friendly handicrafts and paper extraction.',
    descriptionTa: 'இயற்கை கைவினைப் பொருட்கள் மற்றும் காகிதம் செய்யப் பயன்படும் சுத்தமான வாழை தண்டு நார்கள்.',
    image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=400',
    user_id: 'res-user-3',
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString()
  },
  {
    id: 'res-5',
    title: 'Crushed Maize Cobs',
    titleTa: 'நொறுக்கப்பட்ட சோளக் கதிர்கள்',
    crop: 'Maize',
    category: 'crop residues',
    quantity: '2000 kg',
    price: 5000,
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    village: 'Attur',
    pincode: '636102',
    description: 'Maize cobs crushed for pellet feed or bio-fuel combustion. Low moisture content.',
    descriptionTa: 'உயிரி எரிபொருள் மற்றும் தீவனத் தயாரிப்புகளுக்குப் பயன்படுத்தப்படும் உலர் சோளக் தட்டுகள்.',
    image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400',
    user_id: 'res-user-4',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  },
  {
    id: 'res-6',
    title: 'Groundnut Shell Husk Powder',
    titleTa: 'நிலக்கடலை தோல் பொடி',
    crop: 'Groundnut',
    category: 'husk',
    quantity: '1500 kg',
    price: 4500,
    location: 'Tiruvannamalai, Tamil Nadu',
    district: 'Tiruvannamalai',
    village: 'Polur',
    pincode: '606803',
    description: 'Groundnut shells crushed into coarse powder. Ideal for composting or boiler fuel.',
    descriptionTa: 'நிலக்கடலை தோல் பொடி. உரங்கள் மட்குவதற்கும், கொதிகலன் எரிபொருளுக்கும் உகந்தது.',
    image_url: 'https://images.unsplash.com/photo-1592860986161-0ae7901b001d?q=80&w=400',
    user_id: 'res-user-5',
    created_at: new Date().toISOString()
  }
];

export const CROP_AI_CONSULTS: CropAIConsult[] = [
  {
    crop: 'Paddy',
    cropTa: 'நெல்',
    yieldPerAcre: '2.5 tons of Grain',
    yieldPerAcreTa: '2.5 டன் நெல் மணிகள்',
    surplusResource: 'Paddy Straw (approx 3 tons)',
    surplusResourceTa: 'நெல் வைக்கோல் (சுமார் 3 டன்)',
    quantityPredictRatio: 3000,
    pricePredictRatio: 3.0,
    recyclingTip: 'Paddy straw is high in silica. Instead of burning, bale it to sell to dairy farms as cattle feed, or inoculate it to cultivate edible Oyster Mushrooms.',
    recyclingTipTa: 'வைக்கோலை எரிக்காமல், பால் பண்ணைகளுக்குத் தீவனமாக விற்கலாம், அல்லது சிப்பி காளான் வளர்க்கப் பயன்படுத்தலாம்.',
    potentialBuyers: ['Green Valley Dairy Farm', 'Annur Livestock Cooperative'],
    potentialBuyersTa: ['கிரீன் வேலி பால் பண்ணை', 'அன்னூர் கால்நடை கூட்டுறவு சங்கம்']
  },
  {
    crop: 'Sugarcane',
    cropTa: 'கரும்பு',
    yieldPerAcre: '40 tons of Cane',
    yieldPerAcreTa: '40 டன் கரும்பு',
    surplusResource: 'Sugarcane Trash & Bagasse (approx 6 tons)',
    surplusResourceTa: 'கரும்புச் சக்கை & இலைகள் (சுமார் 6 டன்)',
    quantityPredictRatio: 6000,
    pricePredictRatio: 2.5,
    recyclingTip: 'Sugarcane bagasse is highly valued by paper pulp mills and biomass electricity boilers. Field trash can be shredded for mulching to conserve moisture.',
    recyclingTipTa: 'கரும்புச் சக்கையை காகித ஆலைகளுக்கும், உயிரி மின்சாரக் கொதிகலன்களுக்கும் நல்ல விலைக்கு விற்கலாம்.',
    potentialBuyers: ['EcoFert Compost Industry', 'TNPL Paper Mill'],
    potentialBuyersTa: ['ஈகோஃபெர்ட் உரம் தொழிலகம்', 'டி.என்.பி.எல் காகித ஆலை']
  },
  {
    crop: 'Coconut',
    cropTa: 'தேங்காய்',
    yieldPerAcre: '6000 nuts per year',
    yieldPerAcreTa: 'வருடத்திற்கு 6000 தேங்காய்கள்',
    surplusResource: 'Coconut Husk & Fronds (approx 1.5 tons)',
    surplusResourceTa: 'தேங்காய் மட்டை & மட்டைகள் (சுமார் 1.5 டன்)',
    quantityPredictRatio: 1500,
    pricePredictRatio: 4.0,
    recyclingTip: 'Coconut husks can be processed into coir pith for coco peat substrate. Fronds can be shredded and composted to return potassium to your soil.',
    recyclingTipTa: 'மட்டைகளை உரித்து நார் தொழிற்சாலைகளுக்கும், இலைகளை மட்கிய உரமாகவும் மாற்றலாம்.',
    potentialBuyers: ['Pollachi Coir Pith Exporters', 'EcoFert Compost Industry'],
    potentialBuyersTa: ['பொள்ளாச்சி நார் உரம் ஏற்றுமதியாளர்கள்', 'ஈகோஃபெர்ட் உரம் தொழிலகம்']
  },
  {
    crop: 'Banana',
    cropTa: 'வாழை',
    yieldPerAcre: '1000 bunches',
    yieldPerAcreTa: '1000 வாழைத் தார்கள்',
    surplusResource: 'Banana Pseudo-Stem (approx 5 tons)',
    surplusResourceTa: 'வாழைத் தண்டுகள் (சுமார் 5 டன்)',
    quantityPredictRatio: 5000,
    pricePredictRatio: 5.0,
    recyclingTip: 'Banana pseudo-stems contain high-strength natural fibers. Process them using a decorticator to sell fiber for clothing, rope, and organic paper.',
    recyclingTipTa: 'வாழைத் தண்டுகளிலிருந்து நார்களைப் பிரித்தெடுத்து கைவினைப் பொருட்கள் மற்றும் காகிதம் செய்ய விற்கலாம்.',
    potentialBuyers: ['Trichy Eco-Fiber Crafts', 'Annamalai Composting Ltd.'],
    potentialBuyersTa: ['திருச்சி இயற்கை நார் கைவினைகள்', 'அண்ணாமலை மட்கிய உரம்']
  },
  {
    crop: 'Maize',
    cropTa: 'சோளம்',
    yieldPerAcre: '3 tons of Corn',
    yieldPerAcreTa: '3 டன் சோளம்',
    surplusResource: 'Corn Stalks & Cobs (approx 3.5 tons)',
    surplusResourceTa: 'சோளத் தட்டைகள் & கதிர்கள் (சுமார் 3.5 டன்)',
    quantityPredictRatio: 3500,
    pricePredictRatio: 2.8,
    recyclingTip: 'Maize stover can be chopped into silage for high-energy dairy cattle feed during summer, or sold to biomass plants for energy pellets.',
    recyclingTipTa: 'சோள தட்டுகளை அரைத்து மாட்டுத் தீவன சிலேஜாகவும், உயிரி எரிபொருள் கட்டைகளாகவும் மாற்றலாம்.',
    potentialBuyers: ['Green Valley Dairy Farm', 'Coimbatore Bio-Energy Pellets'],
    potentialBuyersTa: ['கிரீன் வேலி பால் பண்ணை', 'கோவை பயோ எனர்ஜி பெல்லட்ஸ்']
  },
  {
    crop: 'Groundnut',
    cropTa: 'நிலக்கடலை',
    yieldPerAcre: '1.2 tons of Groundnut',
    yieldPerAcreTa: '1.2 டன் நிலக்கடலை',
    surplusResource: 'Groundnut Shells & Vines (approx 1.8 tons)',
    surplusResourceTa: 'நிலக்கடலை தோடுகள் & கொடிகள் (சுமார் 1.8 டன்)',
    quantityPredictRatio: 1800,
    pricePredictRatio: 3.5,
    recyclingTip: 'Groundnut vines are rich in protein and serve as excellent hay for cattle. Shells can be crushed for soil aeration mixes or bio-fuel boiler feed.',
    recyclingTipTa: 'நிலக்கடலைக் கொடிகள் சிறந்த மாட்டுத் தீவனம். தோடுகளை நொறுக்கி கொதிகலன் எரிபொருளாக விற்கலாம்.',
    potentialBuyers: ['Rajan Organic Farms', 'Salem Boiler Fuels'],
    potentialBuyersTa: ['ராஜன் இயற்கை பண்ணை', 'சேலம் பாய்லர் ஃபியூல்ஸ்']
  },
  {
    crop: 'Cotton',
    cropTa: 'பருத்தி',
    yieldPerAcre: '800 kg Seed Cotton',
    yieldPerAcreTa: '800 கிலோ பருத்தி',
    surplusResource: 'Cotton Stalks (approx 1.2 tons)',
    surplusResourceTa: 'பருத்திச் செடிகளின் தண்டுகள் (சுமார் 1.2 டன்)',
    quantityPredictRatio: 1200,
    pricePredictRatio: 2.0,
    recyclingTip: 'Cotton stalks must be cleared to prevent pink bollworm pests. Chippping them for particle-board plants or composting are carbon-safe methods.',
    recyclingTipTa: 'பருத்தித் தண்டுகளை அறுத்தெடுத்து துகள் பலகைத் தயாரிப்பு அல்லது உரமாக்கப் பயன்படுத்தலாம்.',
    potentialBuyers: ['Vellore Woodboard Industries', 'EcoFert Compost Industry'],
    potentialBuyersTa: ['வேலூர் வுட்போர்டு தொழிலகம்', 'ஈகோஃபெர்ட் உரம் தொழிலகம்']
  },
  {
    crop: 'Arecanut',
    cropTa: 'பாக்கு',
    yieldPerAcre: '1.2 tons of Arecanuts',
    yieldPerAcreTa: '1.2 டன் பாக்கு',
    surplusResource: 'Areca Leaf Sheaths (approx 2000 pieces)',
    surplusResourceTa: 'பாக்கு மட்டைகள் (சுமார் 2000 துண்டுகள்)',
    quantityPredictRatio: 800,
    pricePredictRatio: 3.5,
    recyclingTip: 'Areca leaf sheaths are excellent for producing biodegradable eco-friendly plates and cups. TNAU extensions offer plate pressing machines.',
    recyclingTipTa: 'பாக்கு மட்டைகளைக் கொண்டு மட்கும் பாக்குமட்டை தட்டுகள் மற்றும் கோப்பைகள் தயாரிக்கலாம்.',
    potentialBuyers: ['EcoFert Compost Industry', 'Rajan Organic Farms'],
    potentialBuyersTa: ['ஈகோஃபெர்ட் உரம் தொழிலகம்', 'ராஜன் இயற்கை பண்ணை']
  },
  {
    crop: 'Sesame',
    cropTa: 'எள்',
    yieldPerAcre: '600 kg of Seeds',
    yieldPerAcreTa: '600 கிலோ எள் விதைகள்',
    surplusResource: 'Sesame Stalks & Stover (approx 1 ton)',
    surplusResourceTa: 'எள் தட்டை (சுமார் 1 டன்)',
    quantityPredictRatio: 1000,
    pricePredictRatio: 2.2,
    recyclingTip: 'Sesame stalks are rich in lignin and can be burned for clean biomass fuel, or crushed to construct low-cost particle boards.',
    recyclingTipTa: 'எள் தட்டுகளை கொதிகலன் எரிபொருளாகவும், துகள் பலகைகள் செய்யவும் பயன்படுத்தலாம்.',
    potentialBuyers: ['Salem Boiler Fuels', 'Rajan Organic Farms'],
    potentialBuyersTa: ['சேலம் பாய்லர் ஃபியூல்ஸ்', 'ராஜன் இயற்கை பண்ணை']
  },
  {
    crop: 'Millets',
    cropTa: 'சிறுதானியங்கள்',
    yieldPerAcre: '1.5 tons of Grain',
    yieldPerAcreTa: '1.5 டன் சிறுதானியம்',
    surplusResource: 'Millet Straw & Husk (approx 2 tons)',
    surplusResourceTa: 'சிறுதானிய தட்டு & உமி (சுமார் 2 டன்)',
    quantityPredictRatio: 2000,
    pricePredictRatio: 3.2,
    recyclingTip: 'Millet straw has high digestibility for sheep and goats. Millet husks make an excellent carbon source for composting and bio-char production.',
    recyclingTipTa: 'சிறுதானியத் தட்டுகளை ஆடுகளுக்குத் தீவனமாகவும், உமியை பயோ-சார் கரியாகவும் மாற்றலாம்.',
    potentialBuyers: ['Annur Livestock Cooperative', 'Rajan Organic Farms'],
    potentialBuyersTa: ['அன்னூர் கால்நடை கூட்டுறவு சங்கம்', 'ராஜன் இயற்கை பண்ணை']
  }
];
