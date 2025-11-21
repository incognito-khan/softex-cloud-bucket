import { prisma } from "../lib/prisma.js";
import { hashPassword, compareHash } from "../lib/hash.js";
import { sendEmail } from "../lib/email.js";
import jwt from "jsonwebtoken";
import geoip from "geoip-lite";

export async function signUp(req, res) {
    try {
        const { accountType, firstName, lastName, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Already an account with this email" });
        };

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                accountType,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                isActive: true
            }
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp: otp,
                otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
            }
        });

        await sendEmail({
            to: email,
            type: "otp",
            data: { otp }
        });

        res.status(201).json({ success: true, message: "User created. OTP sent to email." });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password, accountType } = req.body;

        const userAgent = req.headers["user-agent"] || "Unknown Device";

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            "Unknown IP";

        // 📌 GET LOCATION FROM IP
        const geo = geoip.lookup(ip);
        const location = geo
            ? `${geo.city}, ${geo.country}`
            : "Unknown Location";

        // 📌 LOGIN TIME
        const time = new Date().toLocaleString();

        const existingUser = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Account Not Found" })
        };

        if (!existingUser.isVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    otp: otp,
                    otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
                }
            });

            await sendEmail({
                to: email,
                type: "otp",
                data: { otp }
            });

            return res.status(400).json({
                success: false,
                message: "Account not verified. OTP resent to email."
            });
        };

        const isMatch = await compareHash(password, existingUser.password);

        if (!isMatch) {
            res.status(400).status({ success: false, message: "Invalid Password" })
        };

        const accessToken = jwt.sign(
            { userId: existingUser.id, accountType: existingUser.accountType },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        const { password: _, otp, otpExpires, ...userData } = existingUser;

        await sendEmail({
            to: email,
            type: "login",
            data: {
                device: userAgent,
                location,
                time
            }
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: userData,
            accessToken
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

}

export async function verifyOTP(req, res) {
    try {
        const { email, otp, accountType } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: {
                email_accountType: {
                    email,
                    accountType
                }
            }
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User Not Found" })
        };
        if (!existingUser.otp || !existingUser.otpExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP not generated or already used."
            });
        }

        if (existingUser.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Request a new one."
            });
        }

        if (existingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                isVerified: true,
                otp: null,
                otpExpires: null
            }
        });

        await sendEmail({
            to: email,
            type: "account-verify",
            data: { firstName: existingUser.firstName }
        });

        return res.status(200).json({
            success: true,
            message: "Account verified successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}