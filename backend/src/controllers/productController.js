import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// @desc    Get all products (Filter, search, sort, paginate)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const queryObj = {};

    // 1. Search Query
    if (req.query.q) {
      queryObj.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.q, 'i')] } }
      ];
    }

    // 2. Category Filter
    if (req.query.category) {
      // Find category by slug
      const categoryDoc = await Category.findOne({ slug: req.query.category });
      if (categoryDoc) {
        queryObj.category = categoryDoc._id;
      } else if (mongoose.isValidObjectId(req.query.category)) {
        queryObj.category = req.query.category;
      }
    }

    // 3. Brand Filter
    if (req.query.brand) {
      const brandDoc = await Brand.findOne({ slug: req.query.brand });
      if (brandDoc) {
        queryObj.brand = brandDoc._id;
      } else if (mongoose.isValidObjectId(req.query.brand)) {
        queryObj.brand = req.query.brand;
      }
    }

    // 4. Price Filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = parseFloat(req.query.maxPrice);
    }

    // 5. Rating Filter
    if (req.query.rating) {
      queryObj.rating = { $gte: parseFloat(req.query.rating) };
    }

    // 6. Availability Filter
    if (req.query.inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    }

    // 7. Discount Filter
    if (req.query.minDiscount) {
      queryObj.discountPercentage = { $gte: parseFloat(req.query.minDiscount) };
    }

    // 8. Color Filter
    if (req.query.color) {
      queryObj.colors = { $in: [req.query.color] };
    }

    // 9. Size Filter
    if (req.query.size) {
      queryObj.sizes = { $in: [req.query.size] };
    }

    // 10. Subcategory Filter
    if (req.query.subcategory) {
      queryObj.subcategory = req.query.subcategory;
    }

    // Sorting
    let sortObj = {};
    const sortBy = req.query.sortBy || 'relevance';

    switch (sortBy) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'priceAsc':
        sortObj = { price: 1 };
        break;
      case 'priceDesc':
        sortObj = { price: -1 };
        break;
      case 'ratingDesc':
        sortObj = { rating: -1 };
        break;
      case 'bestSelling':
        sortObj = { salesCount: -1 };
        break;
      case 'relevance':
      default:
        // Default to views count or newer if relevance is not explicitly scored
        sortObj = { viewsCount: -1, createdAt: -1 };
        break;
    }

    const totalProducts = await Product.countDocuments(queryObj);
    
    const products = await Product.find(queryObj)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      page,
      pages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('brand', 'name slug logo');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view counter for AI suggestions
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    discountPercentage,
    stock,
    category,
    brand,
    images,
    colors,
    sizes,
    specifications,
    tags
  } = req.body;

  try {
    const product = await Product.create({
      title,
      description,
      price,
      discountPercentage,
      stock,
      category,
      brand,
      images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      colors,
      sizes,
      specifications,
      tags
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields dynamically
    const fieldsToUpdate = [
      'title', 'description', 'price', 'discountPercentage', 'stock',
      'category', 'brand', 'images', 'colors', 'sizes', 'specifications', 'tags'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get search autocomplete suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;

  try {
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Fuzzy autocomplete search suggestions
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .select('title category')
      .populate('category', 'name')
      .limit(6);

    const suggestions = products.map((prod) => ({
      id: prod._id,
      text: prod.title,
      category: prod.category ? prod.category.name : null
    }));

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-powered recommendations
// @route   GET /api/products/ai/recommendations
// @access  Public/Optional Auth
export const getAiRecommendations = async (req, res) => {
  const { type, productId, userId } = req.query;

  try {
    let recommendations = [];

    // Fallbacks
    const getFallbackProducts = async (limit = 4) => {
      return await Product.find({})
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ rating: -1, salesCount: -1 })
        .limit(limit);
    };

    // 1. Recommended For You (Based on User's browsing or purchase history)
    if (type === 'recommendedForYou') {
      let targetUser = req.user;
      if (!targetUser && userId && mongoose.isValidObjectId(userId)) {
        targetUser = await mongoose.model('User').findById(userId);
      }

      if (targetUser) {
        // Find categories of user's wishlist items & previous orders
        const wishlist = await Wishlist.findOne({ user: targetUser._id });
        const orders = await Order.find({ user: targetUser._id });

        const preferredCategoryIds = new Set();
        
        if (wishlist && wishlist.products.length > 0) {
          const wishProducts = await Product.find({ _id: { $in: wishlist.products } });
          wishProducts.forEach(p => preferredCategoryIds.add(p.category.toString()));
        }

        orders.forEach((ord) => {
          ord.orderItems.forEach((item) => {
            if (item.product) preferredCategoryIds.add(item.product.toString());
          });
        });

        if (preferredCategoryIds.size > 0) {
          recommendations = await Product.find({
            category: { $in: Array.from(preferredCategoryIds) },
            _id: { $nin: wishlist ? wishlist.products : [] } // Exclude what's already in wishlist
          })
            .populate('category', 'name')
            .populate('brand', 'name')
            .sort({ rating: -1 })
            .limit(6);
        }
      }

      if (recommendations.length === 0) {
        recommendations = await Product.find({})
          .populate('category', 'name')
          .populate('brand', 'name')
          .sort({ discountPercentage: -1, rating: -1 })
          .limit(6);
      }
    }

    // 2. Similar Products (Matches category & brand, excludes original product)
    else if (type === 'similarProducts' && productId) {
      const originalProduct = await Product.findById(productId);
      if (originalProduct) {
        recommendations = await Product.find({
          category: originalProduct.category,
          _id: { $ne: originalProduct._id }
        })
          .populate('category', 'name')
          .populate('brand', 'name')
          .sort({ rating: -1 })
          .limit(4);
      }
      if (recommendations.length === 0) {
        recommendations = await getFallbackProducts(4);
      }
    }

    // 3. Frequently Bought Together (Finds same-category popular or cross-sell products)
    else if (type === 'frequentlyBoughtTogether' && productId) {
      const originalProduct = await Product.findById(productId);
      if (originalProduct) {
        // Cross-category popular products or items within the accessory/similar tag
        recommendations = await Product.find({
          _id: { $ne: originalProduct._id },
          $or: [
            { category: originalProduct.category },
            { tags: { $in: originalProduct.tags } }
          ]
        })
          .populate('category', 'name')
          .populate('brand', 'name')
          .sort({ salesCount: -1 })
          .limit(3);
      }
      if (recommendations.length === 0) {
        recommendations = await getFallbackProducts(3);
      }
    }

    // 4. Trending Near You (ViewsCount and SalesCount metrics)
    else if (type === 'trendingNearYou') {
      recommendations = await Product.find({})
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ viewsCount: -1, salesCount: -1 })
        .limit(6);
    }

    // 5. Customers Also Viewed
    else if (type === 'customersAlsoViewed' && productId) {
      const originalProduct = await Product.findById(productId);
      if (originalProduct) {
        recommendations = await Product.find({
          category: originalProduct.category,
          _id: { $ne: originalProduct._id }
        })
          .populate('category', 'name')
          .populate('brand', 'name')
          .sort({ viewsCount: -1 })
          .limit(5);
      }
      if (recommendations.length === 0) {
        recommendations = await getFallbackProducts(5);
      }
    }

    // Default response fallback
    else {
      recommendations = await getFallbackProducts(6);
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
