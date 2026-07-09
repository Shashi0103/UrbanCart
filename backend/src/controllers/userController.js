import User from '../models/User.js';

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user shipping addresses
// @route   GET /api/users/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.shippingAddresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add shipping address
// @route   POST /api/users/addresses
// @access  Private
export const addUserAddress = async (req, res) => {
  const { street, city, state, postalCode, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.shippingAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If first address, make it default automatically
    const isFirstAddress = user.shippingAddresses.length === 0;

    user.shippingAddresses.push({
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isFirstAddress ? true : (isDefault || false)
    });

    await user.save();
    res.status(201).json(user.shippingAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update shipping address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateUserAddress = async (req, res) => {
  const { id } = req.params;
  const { street, city, state, postalCode, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);
    const address = user.shippingAddresses.id(id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      user.shippingAddresses.forEach((addr) => {
        if (addr._id.toString() !== id) {
          addr.isDefault = false;
        }
      });
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();
    res.json(user.shippingAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteUserAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.user._id);
    
    // Pull the subdocument address by ID
    user.shippingAddresses = user.shippingAddresses.filter(
      (addr) => addr._id.toString() !== id
    );

    // If default address was deleted, set default to the first address if any
    const hasDefault = user.shippingAddresses.some((addr) => addr.isDefault);
    if (!hasDefault && user.shippingAddresses.length > 0) {
      user.shippingAddresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.shippingAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user blocked status (Admin only)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleUserBlock = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot block themselves' });
    }

    user.blocked = !user.blocked;
    
    // If blocked, clear session tokens
    if (user.blocked) {
      user.refreshTokens = [];
    }

    await user.save();
    res.json({ message: `User status changed to ${user.blocked ? 'Blocked' : 'Active'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle admin status (Admin only)
// @route   PUT /api/users/:id/admin
// @access  Private/Admin
export const toggleUserAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot demote themselves' });
    }

    user.role = user.role === 'admin' ? 'customer' : 'admin';
    await user.save();
    res.json({ message: `User role changed to ${user.role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
