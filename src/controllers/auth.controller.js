import {
  authenticateUser,
  registerUser,
  getAllUsers,
  changePassword,
  getUserById
} from '../services/auth.service.js';

/**
 * Login user
 * Route: POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    const result = await authenticateUser(username, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });

  } catch (error) {
    const statusCode = error.message === 'Invalid credentials' ? 401 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Register new user
 * Route: POST /api/auth/register
 * Note: In production, this should be admin-only
 */
export const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: username, email, password, full_name, role'
      });
    }

    const result = await registerUser({ username, email, password, full_name, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });

  } catch (error) {
    const statusCode = error.message.includes('already') ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * Route: GET /api/auth/profile
 * Requires: Authentication
 */
export const getProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Change password
 * Route: PUT /api/auth/change-password
 * Requires: Authentication
 */
export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    await changePassword(req.user.userId, current_password, new_password);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    const statusCode = error.message.includes('incorrect') ? 401 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all users (admin only)
 * Route: GET /api/auth/users
 * Requires: Admin role
 */
export const listUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await getAllUsers(role || null);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
