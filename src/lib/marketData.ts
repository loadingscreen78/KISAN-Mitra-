// Complete Chennai Market Data with all vegetables sorted by price (highest to lowest)

export interface Crop {
  name: string;
  price: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  previousPrice: string;
}

export interface Market {
  id: number;
  name: string;
  location: string;
  distance: string;
  latitude: number;
  longitude: number;
  crops: Crop[];
}

// Complete vegetables data sorted by price (highest to lowest)
const allChennaiVegetables: Crop[] = [
  { name: 'Garlic', price: '₹127/kg', change: '+5%', trend: 'up', previousPrice: '₹121/kg' },
  { name: 'Mushroom', price: '₹106/kg', change: '+7%', trend: 'up', previousPrice: '₹99/kg' },
  { name: 'Ginger', price: '₹90/kg', change: '+6%', trend: 'up', previousPrice: '₹85/kg' },
  { name: 'Amla', price: '₹86/kg', change: '+3%', trend: 'up', previousPrice: '₹83/kg' },
  { name: 'Coconut', price: '₹84/kg', change: '+7%', trend: 'up', previousPrice: '₹78/kg' },
  { name: 'French Beans', price: '₹74/kg', change: '+8%', trend: 'up', previousPrice: '₹69/kg' },
  { name: 'Baby Corn', price: '₹68/kg', change: '+6%', trend: 'up', previousPrice: '₹64/kg' },
  { name: 'Sweet Potato', price: '₹68/kg', change: '+6%', trend: 'up', previousPrice: '₹64/kg' },
  { name: 'Lemon', price: '₹62/kg', change: '+2%', trend: 'up', previousPrice: '₹61/kg' },
  { name: 'Drumsticks', price: '₹61/kg', change: '+5%', trend: 'up', previousPrice: '₹58/kg' },
  { name: 'Butter Beans', price: '₹61/kg', change: '+5%', trend: 'up', previousPrice: '₹58/kg' },
  { name: 'Onion Small', price: '₹59/kg', change: '+4%', trend: 'up', previousPrice: '₹57/kg' },
  { name: 'Green Peas', price: '₹58/kg', change: '-5%', trend: 'down', previousPrice: '₹61/kg' },
  { name: 'Capsicum', price: '₹56/kg', change: '+7%', trend: 'up', previousPrice: '₹52/kg' },
  { name: 'Elephant Yam', price: '₹52/kg', change: '+6%', trend: 'up', previousPrice: '₹49/kg' },
  { name: 'Broad Beans', price: '₹50/kg', change: '+6%', trend: 'up', previousPrice: '₹47/kg' },
  { name: 'Green Chilli', price: '₹49/kg', change: '+5%', trend: 'up', previousPrice: '₹47/kg' },
  { name: 'Cluster Beans', price: '₹49/kg', change: '+6%', trend: 'up', previousPrice: '₹46/kg' },
  { name: 'Carrot', price: '₹48/kg', change: '-4%', trend: 'down', previousPrice: '₹50/kg' },
  { name: 'Ladies Finger', price: '₹48/kg', change: '-3%', trend: 'down', previousPrice: '₹49/kg' },
  { name: 'Onion Green', price: '₹46/kg', change: '+4%', trend: 'up', previousPrice: '₹44/kg' },
  { name: 'Bitter Gourd', price: '₹46/kg', change: '+4%', trend: 'up', previousPrice: '₹44/kg' },
  { name: 'Ridge Gourd', price: '₹46/kg', change: '+4%', trend: 'up', previousPrice: '₹44/kg' },
  { name: 'Shallot', price: '₹45/kg', change: '+4%', trend: 'up', previousPrice: '₹43/kg' },
  { name: 'Beetroot', price: '₹44/kg', change: '-2%', trend: 'down', previousPrice: '₹45/kg' },
  { name: 'Ivy Gourd', price: '₹42/kg', change: '+5%', trend: 'up', previousPrice: '₹40/kg' },
  { name: 'Snake Gourd', price: '₹41/kg', change: '+5%', trend: 'up', previousPrice: '₹39/kg' },
  { name: 'Brinjal', price: '₹40/kg', change: '+9%', trend: 'up', previousPrice: '₹37/kg' },
  { name: 'Bottle Gourd', price: '₹39/kg', change: '+6%', trend: 'up', previousPrice: '₹37/kg' },
  { name: 'Raw Mango', price: '₹37/kg', change: '+6%', trend: 'up', previousPrice: '₹35/kg' },
  { name: 'Cabbage', price: '₹37/kg', change: '+8%', trend: 'up', previousPrice: '₹34/kg' },
  { name: 'Cauliflower', price: '₹37/kg', change: '+12%', trend: 'up', previousPrice: '₹33/kg' },
  { name: 'Radish', price: '₹35/kg', change: '+7%', trend: 'up', previousPrice: '₹33/kg' },
  { name: 'Potato', price: '₹34/kg', change: '+2%', trend: 'up', previousPrice: '₹33/kg' },
  { name: 'Cucumber', price: '₹34/kg', change: '+3%', trend: 'up', previousPrice: '₹33/kg' },
  { name: 'Corn', price: '₹34/kg', change: '+6%', trend: 'up', previousPrice: '₹32/kg' },
  { name: 'Onion Big', price: '₹32/kg', change: '+3%', trend: 'up', previousPrice: '₹31/kg' },
  { name: 'Colocasia', price: '₹32/kg', change: '+3%', trend: 'up', previousPrice: '₹31/kg' },
  { name: 'Curry Leaves', price: '₹32/kg', change: '+3%', trend: 'up', previousPrice: '₹31/kg' },
  { name: 'Tomato', price: '₹31/kg', change: '+6%', trend: 'up', previousPrice: '₹29/kg' },
  { name: 'Pumpkin', price: '₹27/kg', change: '+4%', trend: 'up', previousPrice: '₹26/kg' },
  { name: 'Banana Flower', price: '₹23/kg', change: '+5%', trend: 'up', previousPrice: '₹22/kg' },
  { name: 'Ash Gourd', price: '₹22/kg', change: '+5%', trend: 'up', previousPrice: '₹21/kg' },
  { name: 'Mustard Leaves', price: '₹22/kg', change: '+5%', trend: 'up', previousPrice: '₹21/kg' },
  { name: 'Amaranth Leaves', price: '₹21/kg', change: '+5%', trend: 'up', previousPrice: '₹20/kg' },
  { name: 'Sorrel Leaves', price: '₹17/kg', change: '+6%', trend: 'up', previousPrice: '₹16/kg' },
  { name: 'Colocasia Leaves', price: '₹16/kg', change: '+7%', trend: 'up', previousPrice: '₹15/kg' },
  { name: 'Spinach', price: '₹16/kg', change: '+7%', trend: 'up', previousPrice: '₹15/kg' },
  { name: 'Raw Banana', price: '₹15/kg', change: '+7%', trend: 'up', previousPrice: '₹14/kg' },
  { name: 'Fenugreek Leaves', price: '₹15/kg', change: '+7%', trend: 'up', previousPrice: '₹14/kg' },
  { name: 'Coriander Leaves', price: '₹14/kg', change: '+8%', trend: 'up', previousPrice: '₹13/kg' },
  { name: 'Dill Leaves', price: '₹14/kg', change: '+8%', trend: 'up', previousPrice: '₹13/kg' },
  { name: 'Mint Leaves', price: '₹4/kg', change: '+14%', trend: 'up', previousPrice: '₹3.50/kg' }
];

export const marketData: Market[] = [
  {
    id: 1,
    name: 'Koyambedu Market',
    location: 'Chennai',
    distance: 'Calculating...',
    latitude: 13.0827,
    longitude: 80.1983, // Actual Koyambedu Wholesale Market coordinates
    crops: [...allChennaiVegetables] // All vegetables available at Koyambedu
  },
  {
    id: 2,
    name: 'T. Nagar Market',
    location: 'Chennai', 
    distance: 'Calculating...',
    latitude: 13.0418,
    longitude: 80.2341,
    crops: [...allChennaiVegetables] // All vegetables available at T. Nagar
  },
  {
    id: 3,
    name: 'Flower Bazaar',
    location: 'Chennai',
    distance: 'Calculating...',
    latitude: 13.0845, // Actual Flower Bazaar Road coordinates
    longitude: 80.2785,
    crops: [...allChennaiVegetables] // All vegetables available at Flower Bazaar
  },
  {
    id: 4,
    name: 'George Town Market',
    location: 'Chennai',
    distance: 'Calculating...',
    latitude: 13.0878,
    longitude: 80.2785,
    crops: [...allChennaiVegetables] // All vegetables available at George Town
  }
];

// Helper function to extract numeric price for sorting
export const getNumericPrice = (priceString: string): number => {
  const numericValue = priceString.replace(/[₹,]/g, '').split('/')[0];
  return parseFloat(numericValue) || 0;
};

// Function to get top N highest priced crops
export const getTopHighestPricedCrops = (crops: Crop[], count: number = 5): Crop[] => {
  return [...crops]
    .sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price))
    .slice(0, count);
};