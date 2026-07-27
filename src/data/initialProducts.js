export const INITIAL_PRODUCTS = [
  // BAGS
  {
    id: 'bag-1',
    title: 'Monaco Tuscan Leather Weekender Bag',
    category: 'Bags',
    price: 349,
    originalPrice: 420,
    rating: 4.9,
    reviewsCount: 48,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    description: 'Handcrafted from full-grain vegetable-tanned Italian calfskin. Features solid brass hardware, reinforced leather handles, and a spacious lined main compartment.',
    featured: true,
    stock: 12
  },
  {
    id: 'bag-2',
    title: 'Sienna Leather Crossbody Satchel',
    category: 'Bags',
    price: 220,
    originalPrice: 260,
    rating: 4.8,
    reviewsCount: 35,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    description: 'Minimalist luxury handbag designed for everyday elegance. Includes adjustable shoulder strap, interior zip pocket, and magnetic closure.',
    featured: true,
    stock: 8
  },
  {
    id: 'bag-3',
    title: 'Vanguard Executive Leather Briefcase',
    category: 'Bags',
    price: 395,
    originalPrice: 450,
    rating: 5.0,
    reviewsCount: 62,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered for modern professionals. Dedicated padded 16" laptop sleeve, document dividers, and premium YKK zippers.',
    featured: false,
    stock: 15
  },
  {
    id: 'bag-4',
    title: 'Amalfi Leather Backpack',
    category: 'Bags',
    price: 280,
    originalPrice: 320,
    rating: 4.7,
    reviewsCount: 29,
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek urban backpack crafted from buttery soft antique brown leather. Features ergonomic padded straps and quick-access side pockets.',
    featured: false,
    stock: 10
  },

  // WALLET
  {
    id: 'wallet-1',
    title: 'Royal Bifold RFID Leather Wallet',
    category: 'Wallet',
    price: 85,
    originalPrice: 110,
    rating: 4.9,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    description: 'Slim bifold wallet with built-in RFID blocking technology. Holds up to 10 cards and cash with zero bulk.',
    featured: true,
    stock: 25
  },
  {
    id: 'wallet-2',
    title: 'Verona Zip-Around Long Wallet',
    category: 'Wallet',
    price: 130,
    originalPrice: 160,
    rating: 4.8,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1606503830058-7dc74b4805f0?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant continental long wallet crafted with textured saffiano finish leather. Multiple currency slots, coin compartment, and 12 card slots.',
    featured: false,
    stock: 18
  },
  {
    id: 'wallet-3',
    title: 'Minimalist Card Holder & Money Clip',
    category: 'Wallet',
    price: 65,
    originalPrice: 80,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-thin front-pocket card holder with integrated brushed steel money clip for bills.',
    featured: true,
    stock: 30
  },

  // JACKET
  {
    id: 'jacket-1',
    title: 'Classic Heritage Lambskin Leather Jacket',
    category: 'Jacket',
    price: 495,
    originalPrice: 580,
    rating: 5.0,
    reviewsCount: 76,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    description: 'Timeless biker jacket crafted from ultra-supple full-grain lambskin. Features asymmetrical zip closure and quilted shoulder padding.',
    featured: true,
    stock: 7
  },
  {
    id: 'jacket-2',
    title: 'Milano Suede Bomber Jacket',
    category: 'Jacket',
    price: 440,
    originalPrice: 510,
    rating: 4.8,
    reviewsCount: 41,
    image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80',
    description: 'Luxurious goat suede bomber jacket in cognac brown. Ribbed cuffs and hem, satin interior lining, and interior welt pockets.',
    featured: false,
    stock: 9
  },
  {
    id: 'jacket-3',
    title: 'Vintage Aviator Shearling Leather Coat',
    category: 'Jacket',
    price: 650,
    originalPrice: 750,
    rating: 4.9,
    reviewsCount: 33,
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight flight jacket lined with genuine plush shearling wool. Belted collar and antique brass buckles.',
    featured: true,
    stock: 5
  },

  // BELT
  {
    id: 'belt-1',
    title: 'Tuscan Full-Grain Leather Dress Belt',
    category: 'Belt',
    price: 75,
    originalPrice: 95,
    rating: 4.9,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8ec5522?auto=format&fit=crop&w=800&q=80',
    description: 'Reversible 35mm dress belt with brushed palladium buckle. Hand-burnished edges for a flawless finish.',
    featured: true,
    stock: 22
  },
  {
    id: 'belt-2',
    title: 'Braided Artisan Leather Casual Belt',
    category: 'Belt',
    price: 68,
    originalPrice: 85,
    rating: 4.7,
    reviewsCount: 51,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-woven braided belt providing micro-adjustable comfort fit. Premium brass harness buckle.',
    featured: false,
    stock: 14
  }
];

export const CATEGORIES = [
  { name: 'All', icon: 'Sparkles', count: 12 },
  { name: 'Bags', icon: 'ShoppingBag', count: 4 },
  { name: 'Wallet', icon: 'Wallet', count: 3 },
  { name: 'Jacket', icon: 'Shirt', count: 3 },
  { name: 'Belt', icon: 'Award', count: 2 }
];
