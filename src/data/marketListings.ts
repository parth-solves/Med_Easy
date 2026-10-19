export type MarketListingKind = 'seller' | 'buyer';

export interface MarketListing {
  id: string;
  medicine: string;
  strength: string;
  kind: MarketListingKind;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  quantity: string;
  price: number;
  isUserAdded?: boolean;
}

export const MARKET_LISTINGS: MarketListing[] = [
  { id: 'med-01', medicine: 'Paracetamol', strength: '500 mg tablets', kind: 'seller', city: 'Srinagar', state: 'Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973, quantity: '120 boxes', price: 185 },
  { id: 'med-02', medicine: 'Cetirizine', strength: '10 mg tablets', kind: 'buyer', city: 'Amritsar', state: 'Punjab', latitude: 31.634, longitude: 74.8723, quantity: '80 boxes', price: 92 },
  { id: 'med-03', medicine: 'ORS', strength: 'Oral rehydration sachets', kind: 'seller', city: 'Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.209, quantity: '250 boxes', price: 145 },
  { id: 'med-04', medicine: 'Omeprazole', strength: '20 mg capsules', kind: 'buyer', city: 'Gurugram', state: 'Haryana', latitude: 28.4595, longitude: 77.0266, quantity: '60 boxes', price: 138 },
  { id: 'med-05', medicine: 'Pantoprazole', strength: '40 mg tablets', kind: 'seller', city: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, quantity: '100 boxes', price: 210 },
  { id: 'med-06', medicine: 'Amoxicillin', strength: '500 mg capsules', kind: 'buyer', city: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, quantity: '45 boxes', price: 265 },
  { id: 'med-07', medicine: 'Azithromycin', strength: '500 mg tablets', kind: 'seller', city: 'Dehradun', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322, quantity: '70 boxes', price: 325 },
  { id: 'med-08', medicine: 'Metformin', strength: '500 mg tablets', kind: 'buyer', city: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, quantity: '90 boxes', price: 118 },
  { id: 'med-09', medicine: 'Amlodipine', strength: '5 mg tablets', kind: 'seller', city: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126, quantity: '110 boxes', price: 155 },
  { id: 'med-10', medicine: 'Losartan', strength: '50 mg tablets', kind: 'buyer', city: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577, quantity: '65 boxes', price: 230 },
  { id: 'med-11', medicine: 'Atorvastatin', strength: '10 mg tablets', kind: 'seller', city: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, quantity: '85 boxes', price: 195 },
  { id: 'med-12', medicine: 'Levothyroxine', strength: '50 mcg tablets', kind: 'buyer', city: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311, quantity: '50 boxes', price: 110 },
  { id: 'med-13', medicine: 'Salbutamol', strength: 'Inhaler', kind: 'seller', city: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777, quantity: '40 pieces', price: 720 },
  { id: 'med-14', medicine: 'Diclofenac', strength: '1% pain relief gel', kind: 'buyer', city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, quantity: '55 boxes', price: 175 },
  { id: 'med-15', medicine: 'Ibuprofen', strength: '400 mg tablets', kind: 'seller', city: 'Panaji', state: 'Goa', latitude: 15.4909, longitude: 73.8278, quantity: '95 boxes', price: 160 },
  { id: 'med-16', medicine: 'Vitamin C', strength: '500 mg tablets', kind: 'buyer', city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, quantity: '100 boxes', price: 125 },
  { id: 'med-17', medicine: 'Vitamin D3', strength: '60,000 IU capsules', kind: 'seller', city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, quantity: '75 boxes', price: 280 },
  { id: 'med-18', medicine: 'Zinc', strength: '20 mg tablets', kind: 'buyer', city: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558, quantity: '65 boxes', price: 105 },
  { id: 'med-19', medicine: 'Folic Acid', strength: '5 mg tablets', kind: 'seller', city: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673, quantity: '90 boxes', price: 85 },
  { id: 'med-20', medicine: 'Iron + Folic Acid', strength: 'Tablets', kind: 'buyer', city: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366, quantity: '70 boxes', price: 135 },
  { id: 'med-21', medicine: 'Cough Syrup', strength: '100 ml bottle', kind: 'seller', city: 'Hyderabad', state: 'Telangana', latitude: 17.385, longitude: 78.4867, quantity: '130 bottles', price: 95 },
  { id: 'med-22', medicine: 'Antacid', strength: 'Chewable tablets', kind: 'buyer', city: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185, quantity: '75 boxes', price: 88 },
  { id: 'med-23', medicine: 'Metronidazole', strength: '400 mg tablets', kind: 'seller', city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.648, quantity: '60 boxes', price: 145 },
  { id: 'med-24', medicine: 'Multivitamin', strength: 'Tablets', kind: 'buyer', city: 'Bhubaneswar', state: 'Odisha', latitude: 20.2961, longitude: 85.8245, quantity: '85 boxes', price: 210 },
  { id: 'med-25', medicine: 'Eye Lubricant', strength: 'Eye drops', kind: 'seller', city: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, quantity: '45 pieces', price: 120 },
  { id: 'med-26', medicine: 'Loratadine', strength: '10 mg tablets', kind: 'buyer', city: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096, quantity: '40 boxes', price: 115 },
  { id: 'med-27', medicine: 'Calcium + Vitamin D', strength: 'Tablets', kind: 'seller', city: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362, quantity: '80 boxes', price: 240 },
  { id: 'med-28', medicine: 'Clotrimazole', strength: '1% skin cream', kind: 'buyer', city: 'Agartala', state: 'Tripura', latitude: 23.8315, longitude: 91.2868, quantity: '35 boxes', price: 98 },
  { id: 'med-29', medicine: 'Povidone-Iodine', strength: '10% solution', kind: 'seller', city: 'Imphal', state: 'Manipur', latitude: 24.817, longitude: 93.9368, quantity: '50 bottles', price: 155 },
  { id: 'med-30', medicine: 'Sodium Chloride', strength: '0.9% saline 500 ml', kind: 'buyer', city: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, quantity: '120 bottles', price: 42 },
];
