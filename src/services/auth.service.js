import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a password with its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 * @param {Object} payload - Data to include in token
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Get user by username from database
 * @param {string} username - Username to search
 * @returns {Object|null} User object or null
 */
export const getUserByUsername = async (username) => {
  const query = 'SELECT * FROM sp_get_user_by_username($1)';
  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
};

/**
 * Get user by ID from database (without password)
 * @param {number} userId - User ID to search
 * @returns {Object|null} User object or null
 */
export const getUserById = async (userId) => {
  const query = 'SELECT * FROM sp_get_user_by_id($1)';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Authenticate user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Object} User data and JWT token
 * @throws {Error} If authentication fails
 */
export const authenticateUser = async (username, password) => {
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is disabled');
  }

  const isValidPassword = await comparePassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    userId: user.user_id,
    username: user.username,
    role: user.role
  });

  return {
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    token
  };
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} New user data and JWT token
 * @throws {Error} If registration fails
 */
export const registerUser = async ({ username, email, password, full_name, role }) => {
  // Validate password strength
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Register user in database
  const query = 'SELECT sp_register_user($1, $2, $3, $4, $5) AS user_id';
  const result = await pool.query(query, [username, email, passwordHash, full_name, role]);

  const userId = result.rows[0].user_id;

  // Generate token for new user
  const token = generateToken({
    userId,
    username,
    role
  });

  return {
    user: {
      user_id: userId,
      username,
      email,
      full_name,
      role
    },
    token
  };
};

/**
 * Get all users (admin only)
 * @param {string|null} role - Optional role filter
 * @returns {Array} List of users
 */
export const getAllUsers = async (role = null) => {
  const query = 'SELECT * FROM sp_get_all_users($1)';
  const result = await pool.query(query, [role]);
  return result.rows;
};

/**
 * Change user password
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password
 * @returns {boolean} Success
 * @throws {Error} If password change fails
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Get user with password hash
  const userQuery = 'SELECT password_hash FROM users WHERE user_id = $1 AND is_active = TRUE';
  const userResult = await pool.query(userQuery, [userId]);

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, userResult.rows[0].password_hash);

  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long');
  }

  // Hash and update
  const newHash = await hashPassword(newPassword);
  const updateQuery = 'SELECT sp_update_user_password($1, $2)';
  await pool.query(updateQuery, [userId, newHash]);

  return true;
};
