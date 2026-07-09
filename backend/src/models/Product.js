import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String, index: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  images: [{ type: String, required: true }],
  colors: [String],
  sizes: [String],
  specifications: [specificationSchema],
  tags: [String],
  viewsCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 }
}, { timestamps: true });

// Create a compound text index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
