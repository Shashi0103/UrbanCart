import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Initialize empty cart & wishlist
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });

      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshTokens.push(refreshToken);
      await user.save();

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.blocked) {
        return res.status(403).json({ message: 'This account has been blocked' });
      }

      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshTokens.push(refreshToken);
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        refreshToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    if (user.blocked) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Generate new access token
    const token = generateToken(user._id);

    res.json({ token });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token has expired or is invalid' });
  }
};

// @desc    Logout user / revoke refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: refreshToken } }
      );
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request forgot password email (Mocked)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate short-lived token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Mock send mail (output to console)
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`\n========================================`);
    console.log(`PASSWORD RESET REQUESTED FOR: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log(`========================================\n`);

    res.json({ 
      message: 'Password reset link generated. Check server console logs for URL.', 
      resetToken // Returned to UI for easy testing in sandbox
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password; // Pre-save hooks will hash it
    user.refreshTokens = []; // Revoke active sessions for security
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired password reset token' });
  }
};

// @desc    Get user profile (current session user)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};
