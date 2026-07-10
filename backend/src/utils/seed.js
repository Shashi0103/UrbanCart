import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Review from '../models/Review.js';
import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urbancart');
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Error connecting to DB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await Cart.deleteMany({});
    await Coupon.deleteMany({});

    console.log('Cleared all previous collection data.');

    // 1. Create Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics', description: 'Gadgets, appliances, and accessories', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500' },
      { name: 'Mobiles', slug: 'mobiles', description: 'Smartphones and accessories', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
      { name: 'Laptops', slug: 'laptops', description: 'Notebooks, netbooks, and hybrid PCs', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, footwear, and designer wear', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500' },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Cookware, decoration, and home items', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500' },
      { name: 'Beauty', slug: 'beauty', description: 'Skincare, cosmetics, and makeup', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500' },
      { name: 'Sports', slug: 'sports', description: 'Fitness gear, shoes, and outdoor gear', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500' }
    ];
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${seededCategories.length} categories.`);

    const catMap = {};
    seededCategories.forEach(c => { catMap[c.slug] = c._id; });

    // 2. Create Brands
    const brandsData = [
      { name: 'Apple', slug: 'apple', description: 'Designed by Apple in California', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500' },
      { name: 'Samsung', slug: 'samsung', description: 'Inspire the World, Create the Future', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500' },
      { name: 'Fujifilm', slug: 'fujifilm', description: 'Value from Innovation', logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500' },
      { name: 'Dell', slug: 'dell', description: 'Powering possibilities', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500' },
      { name: 'Nike', slug: 'nike', description: 'Just Do It', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
      { name: 'Sony', slug: 'sony', description: 'Be Moved', logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500' },
      { name: 'OnePlus', slug: 'oneplus', description: 'Never Settle', logo: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=500' },
      { name: 'Philips', slug: 'philips', description: 'Innovation and You', logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500' },
      { name: 'Zara', slug: 'zara', description: 'Zara Fashion Studio', logo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500' },
      { name: 'Minimalist', slug: 'minimalist', description: 'Skin Science, Transformed', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' },
      { name: "L'Oreal", slug: 'loreal', description: 'Because You Are Worth It', logo: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500' },
      { name: 'Pigeon', slug: 'pigeon', description: 'Classic kitchenware solutions', logo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
      { name: "Levi's", slug: 'levis', description: 'Original high-quality denim styles', logo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' },
      { name: 'Cosco', slug: 'cosco', description: 'Premium sports infrastructure and fitness', logo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500' },
      { name: 'ToyZone', slug: 'toyzone', description: 'Play toys for child safety', logo: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500' },
      { name: 'Wonderchef', slug: 'wonderchef', description: 'Modern cookware technology', logo: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500' },
      { name: 'Ray-Ban', slug: 'rayban', description: 'Genuine high-quality eyewear', logo: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500' },
      { name: 'Prestige', slug: 'prestige', description: 'Prestige kitchen appliances', logo: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500' },
      { name: 'Skybags', slug: 'skybags', description: 'Luggage style on the move', logo: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=500' }
    ];
    const seededBrands = await Brand.insertMany(brandsData);
    console.log(`Seeded ${seededBrands.length} brands.`);

    const brandMap = {};
    seededBrands.forEach(b => { brandMap[b.slug] = b._id; });

    // 3. Create Users
    const adminUser = await User.create({
      name: 'Admin UrbanCart',
      email: 'admin@urbancart.com',
      password: 'admin123',
      role: 'admin',
      shippingAddresses: [
        { street: '101 Admin Lane', city: 'Silicon Valley', state: 'CA', postalCode: '94016', country: 'USA', isDefault: true }
      ]
    });
    await Cart.create({ user: adminUser._id, items: [] });
    await Wishlist.create({ user: adminUser._id, products: [] });

    const customerUser = await User.create({
      name: 'Aarav Sharma',
      email: 'john@gmail.com',
      password: 'password123',
      role: 'customer',
      shippingAddresses: [
        { street: '123 Main Street', city: 'New Delhi', state: 'Delhi', postalCode: '110001', country: 'India', isDefault: true }
      ]
    });
    await Cart.create({ user: customerUser._id, items: [] });
    await Wishlist.create({ user: customerUser._id, products: [] });

    // Seed additional Indian customers for reviews
    const customerUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@gmail.com',
      password: 'password123',
      role: 'customer'
    });
    await Cart.create({ user: customerUser2._id, items: [] });
    await Wishlist.create({ user: customerUser2._id, products: [] });

    const customerUser3 = await User.create({
      name: 'Amit Verma',
      email: 'amit@gmail.com',
      password: 'password123',
      role: 'customer'
    });
    await Cart.create({ user: customerUser3._id, items: [] });
    await Wishlist.create({ user: customerUser3._id, products: [] });

    console.log('Seeded User accounts.');

    // 4. Create Products (Correct Brand Mappings & Valid Images)
    const productsData = [
      // CATEGORY: Mobiles
      {
        title: 'iPhone 15 Pro Max',
        description: 'Titanium design, breakthrough A17 Pro chip, customizable Action button, and a powerful camera system.',
        price: 139900.00,
        discountPercentage: 5.0,
        stock: 25,
        category: catMap['mobiles'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'
        ],
        colors: ['Titanium Grey', 'Titanium Black', 'Titanium Blue'],
        sizes: ['128GB', '256GB', '512GB'],
        specifications: [
          { key: 'Processor', value: 'A17 Pro Chip' },
          { key: 'Display', value: '6.7 inch Super Retina XDR' },
          { key: 'Rear Camera', value: '48MP + 12MP + 12MP' }
        ],
        tags: ['smartphone', 'ios', 'mobile', 'apple'],
        viewsCount: 150,
        salesCount: 12
      },
      {
        title: 'Samsung S21 Ultra 5G',
        description: 'Premium Samsung Galaxy S21 Ultra 5G featuring a contour-cut 108MP camera, 100x Space Zoom, Exynos 2100 processor, and S Pen support.',
        price: 48999.00,
        discountPercentage: 5.0,
        stock: 45,
        category: catMap['mobiles'],
        brand: brandMap['samsung'],
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'
        ],
        colors: ['Phantom Silver', 'Phantom Black'],
        sizes: ['128GB', '256GB'],
        specifications: [
          { key: 'Processor', value: 'Exynos 2100' },
          { key: 'Camera', value: '108MP Quad Camera System' },
          { key: 'Display', value: '6.8 inch Dynamic AMOLED 2X' }
        ],
        tags: ['smartphone', 'android', 'samsung', '5g', 'flagship'],
        viewsCount: 95,
        salesCount: 19
      },

      // CATEGORY: Laptops
      {
        title: 'Dell XPS 15 Laptop',
        description: 'High performance laptop with beautiful InfinityEdge OLED touch display, NVIDIA RTX graphics, and Intel i9 processor.',
        price: 169990.00,
        discountPercentage: 8.0,
        stock: 12,
        category: catMap['laptops'],
        brand: brandMap['dell'],
        images: [
          'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
          'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'
        ],
        colors: ['Platinum Silver', 'Frost White'],
        sizes: ['16GB RAM | 512GB SSD', '32GB RAM | 1TB SSD'],
        specifications: [
          { key: 'Processor', value: 'Intel Core i9 13th Gen' },
          { key: 'Graphics', value: 'NVIDIA GeForce RTX 4060' }
        ],
        tags: ['laptop', 'pc', 'dell', 'workstation'],
        viewsCount: 80,
        salesCount: 4
      },
      {
        title: 'Apple MacBook Air M3',
        description: 'Supercharged by the M3 chip, with an incredibly thin profile, beautiful Liquid Retina display, and up to 18 hours of battery life.',
        price: 114900.00,
        discountPercentage: 5.0,
        stock: 20,
        category: catMap['laptops'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'
        ],
        colors: ['Midnight', 'Space Grey', 'Starlight', 'Silver'],
        sizes: ['8GB RAM | 256GB SSD', '16GB RAM | 512GB SSD'],
        specifications: [
          { key: 'Processor', value: 'Apple M3 Chip' },
          { key: 'Display', value: '13.6 inch Liquid Retina' }
        ],
        tags: ['macbook', 'laptop', 'apple', 'm3'],
        viewsCount: 140,
        salesCount: 14
      },

      // CATEGORY: Electronics
      {
        title: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation, exceptional sound quality, crystal clear calling, and up to 30 hours battery life.',
        price: 29990.00,
        discountPercentage: 15.0,
        stock: 50,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'
        ],
        colors: ['Black', 'Silver'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Driver', value: '30mm Driver' },
          { key: 'Battery Life', value: '30 Hours' }
        ],
        tags: ['audio', 'headphones', 'anc', 'wireless', 'sony'],
        viewsCount: 95,
        salesCount: 15
      },
      {
        title: 'Apple Watch Ultra 2',
        description: 'The most rugged and capable Apple Watch ever. Featuring a lightweight titanium case, up to 36-hour battery life.',
        price: 89900.00,
        discountPercentage: 0.0,
        stock: 18,
        category: catMap['electronics'],
        brand: brandMap['apple'],
        images: [
          'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'
        ],
        colors: ['Titanium Natural'],
        sizes: ['49mm'],
        specifications: [
          { key: 'Case size', value: '49mm' },
          { key: 'Water Resistance', value: '100m' }
        ],
        tags: ['smartwatch', 'apple', 'fitness', 'wearable'],
        viewsCount: 75,
        salesCount: 6
      },
      {
        title: 'OnePlus Pad WiFi Tablet',
        description: '11.61-inch 144Hz screen display, powered by MediaTek Dimensity 9000, 67W SUPERVOOC charging, and sleek metal body.',
        price: 35999.00,
        discountPercentage: 10.0,
        stock: 35,
        category: catMap['electronics'],
        brand: brandMap['oneplus'],
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'
        ],
        colors: ['Halo Green'],
        sizes: ['8GB RAM | 128GB SSD'],
        specifications: [
          { key: 'Display', value: '11.61 inch 144Hz' },
          { key: 'Processor', value: 'Dimensity 9000' }
        ],
        tags: ['tablet', 'oneplus', 'android', 'wifi'],
        viewsCount: 65,
        salesCount: 8
      },
      {
        title: 'Sony Bravia 55 inch 4K Ultra HD TV',
        description: 'Google TV with 4K HDR Processor X1, Motionflow XR 200, Dolby Audio, and built-in access to all streaming apps.',
        price: 57990.00,
        discountPercentage: 12.0,
        stock: 15,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
          'https://images.unsplash.com/photo-1593789198777-f29bc259780e?w=800'
        ],
        colors: ['Black'],
        sizes: ['55 inch'],
        specifications: [
          { key: 'Resolution', value: '3840 x 2160' },
          { key: 'Operating System', value: 'Google TV' }
        ],
        tags: ['tv', 'sony', '4k', 'smart-tv'],
        viewsCount: 110,
        salesCount: 5
      },

      // CATEGORY: Fashion
      {
        title: "Levi's Men 511 Slim Fit Jeans",
        description: 'A modern slim with room to move. The 511 Slim Fit Jeans are a classic since day one, crafted in high stretch denim.',
        price: 2599.00,
        discountPercentage: 25.0,
        stock: 60,
        category: catMap['fashion'],
        subcategory: 'men',
        brand: brandMap['levis'],
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'
        ],
        colors: ['Dark Wash', 'Light Indigo', 'Carbon Black'],
        sizes: ['30', '32', '34', '36'],
        specifications: [
          { key: 'Material', value: '99% Cotton, 1% Elastane' },
          { key: 'Fit', value: 'Slim Fit' }
        ],
        tags: ['jeans', 'clothing', 'levis', 'denim'],
        viewsCount: 88,
        salesCount: 30
      },
      {
        title: "Zara Floral Print Midi Dress",
        description: 'V-neck dress with long sleeves. Featuring self-matching fabric details, tiered skirt panels, and floral illustrations.',
        price: 3990.00,
        discountPercentage: 15.0,
        stock: 22,
        category: catMap['fashion'],
        subcategory: 'women',
        brand: brandMap['zara'],
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800'
        ],
        colors: ['Red/Yellow Floral', 'Blue/White Print'],
        sizes: ['XS', 'S', 'M', 'L'],
        specifications: [
          { key: 'Material', value: '100% Viscose' },
          { key: 'Length', value: 'Midi' }
        ],
        tags: ['dress', 'clothing', 'floral', 'zara', 'midi'],
        viewsCount: 79,
        salesCount: 11
      },

      // CATEGORY: Home & Kitchen
      {
        title: 'Wonderchef Nutri-blend Mixer Grinder',
        description: "India's favorite Mixer-Grinder-Blender. Compact and consumes less space. Easy to operate and clean.",
        price: 4999.00,
        discountPercentage: 25.0,
        stock: 35,
        category: catMap['home-kitchen'],
        brand: brandMap['wonderchef'],
        images: [
          'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800'
        ],
        colors: ['Black', 'Crimson Red'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Power', value: '400 W' },
          { key: 'Jars included', value: '2 Jars' }
        ],
        tags: ['mixer', 'blender', 'kitchen', 'wonderchef'],
        viewsCount: 130,
        salesCount: 20
      },
      {
        title: 'Prestige Induction Cooktop',
        description: 'Prestige induction cooktop with automatic power and temperature adjustments, preset Indian menus, and durable ceramic glass plates.',
        price: 2999.00,
        discountPercentage: 15.0,
        stock: 35,
        category: catMap['home-kitchen'],
        brand: brandMap['prestige'],
        images: [
          'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800'
        ],
        colors: ['Classic Black'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Power', value: '1900 W' },
          { key: 'Base Type', value: 'Induction compatible flat bottom' }
        ],
        tags: ['cooktop', 'kitchen', 'prestige', 'appliance'],
        viewsCount: 115,
        salesCount: 15
      },

      // CATEGORY: Beauty
      {
        title: 'Minimalist 10% Niacinamide Serum',
        description: 'A nourishing daily serum packed with pure Niacinamide and Zinc to clear blemishes, balance sebum, and reduce redness.',
        price: 599.00,
        discountPercentage: 5.0,
        stock: 120,
        category: catMap['beauty'],
        brand: brandMap['minimalist'],
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800'
        ],
        colors: ['Clear'],
        sizes: ['30 ml'],
        specifications: [
          { key: 'Skin Type', value: 'All Skin Types' },
          { key: 'Key Ingredient', value: '10% Niacinamide' }
        ],
        tags: ['serum', 'skincare', 'minimalist', 'beauty'],
        viewsCount: 140,
        salesCount: 55
      },
      {
        title: "L'Oreal Paris Extraordinary Hair Oil",
        description: 'Multi-use hair serum oil infused with a blend of 6 rare flower oils. Deeply nourishes without heavy weigh-down.',
        price: 499.00,
        discountPercentage: 10.0,
        stock: 90,
        category: catMap['beauty'],
        brand: brandMap['loreal'],
        images: [
          'https://images.unsplash.com/photo-1617897903246-719242758050?w=800',
          'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800'
        ],
        colors: ['Amber Tint'],
        sizes: ['100 ml'],
        specifications: [
          { key: 'Hair Type', value: 'Dry & Unruly Hair' },
          { key: 'Key Benefits', value: 'Shine & Smoothness' }
        ],
        tags: ['hair-oil', 'serum', 'loreal', 'haircare'],
        viewsCount: 85,
        salesCount: 38
      },

      // CATEGORY: Sports
      {
        title: 'Nike Air Max 270',
        description: 'Nike first lifestyle Air Max shoe, designed for style and comfort, featuring a large Max Air unit in the heel.',
        price: 9995.00,
        discountPercentage: 20.0,
        stock: 40,
        category: catMap['sports'],
        brand: brandMap['nike'],
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'
        ],
        colors: ['Red/Black', 'White/Blue', 'All Black'],
        sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
        specifications: [
          { key: 'Material', value: 'Mesh / Synthetic' },
          { key: 'Sole', value: 'Rubber' }
        ],
        tags: ['shoes', 'sneakers', 'sports', 'nike'],
        viewsCount: 110,
        salesCount: 22
      },
      {
        title: 'Cosco Tennis Racquet',
        description: 'Lightweight aluminum frame tennis racquet designed for intermediate club players looking for speed and control.',
        price: 1899.00,
        discountPercentage: 20.0,
        stock: 30,
        category: catMap['sports'],
        brand: brandMap['cosco'],
        images: [
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
          'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800'
        ],
        colors: ['Sports Red', 'Volt Yellow'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Frame material', value: 'Aluminum Alloy' },
          { key: 'Weight', value: '280g' }
        ],
        tags: ['racquet', 'tennis', 'sports', 'cosco'],
        viewsCount: 65,
        salesCount: 9
      },
      {
        title: "Zara Men Classic Tan Leather Jacket",
        description: "Tan brown biker jacket made of premium soft sheepskin leather. Includes a lapel collar, asymmetrical zipper fastening, and zipper pockets.",
        price: 7999.00,
        discountPercentage: 10.0,
        stock: 30,
        category: catMap['fashion'],
        subcategory: 'men',
        brand: brandMap['zara'],
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
          'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800'
        ],
        colors: ['Tan Brown', 'Classic Black'],
        sizes: ['S', 'M', 'L', 'XL'],
        specifications: [
          { key: 'Material', value: '100% Genuine Sheepskin Leather' },
          { key: 'Lining', value: '100% Polyester' }
        ],
        tags: ['clothing', 'jacket', 'leather', 'zara', 'fashion'],
        viewsCount: 140,
        salesCount: 15
      },
      {
        title: "Sony Alpha Mirrorless DSLR Camera",
        description: "High-resolution mirrorless DSLR camera. Features a 24.2MP sensor, real-time eye autofocus, 4K video recording, and interchangeable lens mounts.",
        price: 54990.00,
        discountPercentage: 10.0,
        stock: 30,
        category: catMap['electronics'],
        brand: brandMap['sony'],
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'
        ],
        colors: ['Classic Black'],
        sizes: ['18-135mm Lens Kit', 'Body Only'],
        specifications: [
          { key: 'Sensor Resolution', value: '24.2 MP' },
          { key: 'Video Resolution', value: '4K UHD at 30fps' }
        ],
        tags: ['camera', 'dslr', 'electronics', 'sony'],
        viewsCount: 110,
        salesCount: 18
      },
      {
        title: "Ray-Ban Classic Aviator Sunglasses",
        description: "Iconic metal frame aviator sunglasses. Features crystal green lenses with UV protection and a gold-tone classic metal frame.",
        price: 8490.00,
        discountPercentage: 15.0,
        stock: 45,
        category: catMap['fashion'],
        brand: brandMap['rayban'],
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'
        ],
        colors: ['Gold / G-15 Green', 'Black / Polarized Grey'],
        sizes: ['Standard Fit'],
        specifications: [
          { key: 'Frame Material', value: 'Metal' },
          { key: 'Lens Treatment', value: 'Classic G-15 UV protection' }
        ],
        tags: ['eyewear', 'sunglasses', 'rayban', 'fashion'],
        viewsCount: 120,
        salesCount: 22
      },
      {
        title: "Skybags Hardsided Cabin Trolley Bag",
        description: "Lightweight and scratch-resistant polycarbonate cabin trolley bag. Features 360-degree dual spinner wheels and secure TSA combination lock.",
        price: 3999.00,
        discountPercentage: 25.0,
        stock: 40,
        category: catMap['sports'],
        brand: brandMap['skybags'],
        images: [
          'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'
        ],
        colors: ['Midnight Blue', 'Rose Gold'],
        sizes: ['Cabin Size (55 cm)'],
        specifications: [
          { key: 'Material', value: '100% Polycarbonate' },
          { key: 'Wheels', value: '4 Dual Spinner Wheels' }
        ],
        tags: ['luggage', 'bag', 'trolley', 'skybags', 'sports', 'travel'],
        viewsCount: 125,
        salesCount: 25
      },
      {
        title: "Zara Women Satin Evening Gown",
        description: "Elegant satin evening gown with a high slit, draping cowl neckline, and adjustable crossback straps. Perfect for formal parties and events.",
        price: 5990.00,
        discountPercentage: 10.0,
        stock: 30,
        category: catMap['fashion'],
        subcategory: 'women',
        brand: brandMap['zara'],
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
        ],
        colors: ['Ruby Red', 'Midnight Black'],
        sizes: ['S', 'M', 'L', 'XL'],
        specifications: [
          { key: 'Material', value: '100% Satin Polyester' },
          { key: 'Style', value: 'Evening Gown' }
        ],
        tags: ['clothing', 'gown', 'dress', 'women', 'fashion'],
        viewsCount: 140,
        salesCount: 30
      },
      {
        title: "Fujifilm Instax Mini Instant Camera",
        description: "Fun, pocket-sized instant film camera. Features a selfie mirror, automatic exposure control, and instant photo printing capability.",
        price: 5999.00,
        discountPercentage: 10.0,
        stock: 30,
        category: catMap['electronics'],
        brand: brandMap['fujifilm'],
        images: [
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
          'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800'
        ],
        colors: ['Sky Blue', 'Blush Pink', 'Charcoal Gray'],
        sizes: ['Standard'],
        specifications: [
          { key: 'Film Type', value: 'Fujifilm Instax Mini Film' },
          { key: 'Power Source', value: '2 AA Batteries' }
        ],
        tags: ['camera', 'instant', 'electronics', 'gadget'],
        viewsCount: 140,
        salesCount: 30
      },
      {
        title: "Princess Pink Net Frock Gown",
        description: "Beautiful layered net and satin frock gown for girls. Includes an elegant floral waist sash, cotton inner lining, and back zipper closure.",
        price: 1899.00,
        discountPercentage: 15.0,
        stock: 35,
        category: catMap['fashion'],
        subcategory: 'kids',
        brand: brandMap['zara'],
        images: [
          'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800',
          'https://images.unsplash.com/photo-1502716119720-b23a933d31c6?w=800'
        ],
        colors: ['Princess Pink', 'Lavender Dream'],
        sizes: ['3-4 Years', '5-6 Years', '7-8 Years'],
        specifications: [
          { key: 'Material', value: 'Net & Satin with 100% Cotton Lining' },
          { key: 'Occasion', value: 'Party Wear' }
        ],
        tags: ['clothing', 'kids', 'zara', 'frock', 'gown', 'dress', 'fashion'],
        viewsCount: 110,
        salesCount: 18
      },
      {
        title: "Zara Kids Hooded Denim Jacket",
        description: "Classic light-wash denim jacket for kids. Features a cozy cotton fleece hood, button front closure, and dual chest pockets.",
        price: 1999.00,
        discountPercentage: 15.0,
        stock: 35,
        category: catMap['fashion'],
        subcategory: 'kids',
        brand: brandMap['zara'],
        images: [
          'https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=800',
          'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800'
        ],
        colors: ['Light Indigo'],
        sizes: ['3-4 Years', '5-6 Years', '7-8 Years'],
        specifications: [
          { key: 'Material', value: '100% Cotton Denim with Fleece Hood' }
        ],
        tags: ['clothing', 'kids', 'zara', 'jacket', 'fashion'],
        viewsCount: 110,
        salesCount: 15
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log(`Seeded ${seededProducts.length} products.`);

    // 5. Create Reviews
    const reviewData = [
      {
        user: customerUser._id,
        product: seededProducts[0]._id, // iPhone
        rating: 5,
        comment: 'Absolutely amazing! The battery backup on the Pro Max is unparalleled, and the cameras shoot professional quality video.',
        helpfulCount: 4,
        helpfulUsers: [adminUser._id]
      },
      {
        user: customerUser2._id,
        product: seededProducts[4]._id, // Sony XM5
        rating: 4,
        comment: 'Sound cancellation is superb. Sound stage could be a bit wider but overall very satisfied. Battery lasts forever.',
        helpfulCount: 2
      },
      {
        user: customerUser3._id,
        product: seededProducts[12]._id, // Nike Air Max
        rating: 5,
        comment: 'Super comfortable for daily walks and runs. Looks stylish too.',
        helpfulCount: 7
      }
    ];

    await Review.insertMany(reviewData);
    console.log('Seeded sample reviews.');

    // Update product ratings
    for (const prod of seededProducts) {
      const reviews = await Review.find({ product: prod._id });
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, item) => item.rating + acc, 0);
        prod.rating = parseFloat((sum / reviews.length).toFixed(1));
        await prod.save();
      } else {
        prod.rating = 4.5;
        await prod.save();
      }
    }
    console.log('Recalculated product ratings.');

    // 6. Seed Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountAmount: 10,
      minPurchase: 3000,
      expiryDate: new Date('2027-12-31'),
      isActive: true
    });
    await Coupon.create({
      code: 'URBAN500',
      discountType: 'fixed',
      discountAmount: 500,
      minPurchase: 10000,
      expiryDate: new Date('2027-12-31'),
      isActive: true
    });
    console.log('Seeded coupon codes.');

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB data:', error.message);
    process.exit(1);
  }
};

seedData();
