import Brand from '../models/Brand.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a brand (Admin only)
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
  const { name, description, logo } = req.body;

  try {
    const slug = slugify(name);
    const brandExists = await Brand.findOne({ slug });

    if (brandExists) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = await Brand.create({
      name,
      slug,
      description,
      logo: logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=500'
    });

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a brand (Admin only)
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, description, logo } = req.body;

  try {
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    if (name) {
      brand.name = name;
      brand.slug = slugify(name);
    }
    brand.description = description !== undefined ? description : brand.description;
    brand.logo = logo || brand.logo;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a brand (Admin only)
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await Brand.deleteOne({ _id: id });
    res.json({ message: 'Brand removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
