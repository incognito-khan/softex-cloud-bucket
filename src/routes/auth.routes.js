import { Router } from "express";
import { signUp, login, verifyOTP, forgotPassword, changePassword } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Create a new user and send OTP
 */
router.post("/signup", signUp);

/**
 * @route   POST /api/auth/login
 * @desc    Login User and send OTP if not verified
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/verifyOTP
 * @desc    Verify OTP through email and account type
 */
router.post("/verifyOTP", verifyOTP);

/**
 * @route   POST /api/auth/forgotPassword
 * @desc    Verify OTP through email and account type
 */
router.post("/forgotPassword", forgotPassword);

/**
 * @route   POST /api/auth/changePassword
 * @desc    Verify OTP through email and account type
 */
router.post("/changePassword", changePassword);

export default router;
