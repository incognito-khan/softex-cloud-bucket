import { prisma } from "../lib/prisma.js";
import { hashPassword, compareHash } from "../lib/hash.js";
import { sendEmail } from "../lib/email.js";
import jwt from "jsonwebtoken";
import geoip from "geoip-lite";
import { createOTP } from "../lib/create-otp.js";

// export async function signUp(req, res) {
//     try {
//         const { accountType, firstName, lastName, email, password } = req.body;

//         const existingUser = await prisma.user.findUnique({
//             where: { email_accountType: { email, accountType } }
//         });

//         if (existingUser) {
//             return res.status(400).json({ success: false, message: "Already an account with this email" });
//         };

//         const hashedPassword = await hashPassword(password);

//         const user = await prisma.user.create({
//             data: {
//                 accountType,
//                 email,
//                 password: hashedPassword,
//                 firstName,
//                 lastName,
//                 isActive: true
//             }
//         });

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         await prisma.user.update({
//             where: { id: user.id },
//             data: {
//                 otp: otp,
//                 otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
//             }
//         });

//         await sendEmail({
//             to: email,
//             type: "otp",
//             data: { otp }
//         });

//         res.status(201).json({ success: true, message: "User created. OTP sent to email." });
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }

// export async function login(req, res) {
//     try {
//         const { email, password, accountType } = req.body;

//         const userAgent = req.headers["user-agent"] || "Unknown Device";

//         const ip =
//             req.headers["x-forwarded-for"]?.split(",")[0] ||
//             req.socket.remoteAddress ||
//             "Unknown IP";

//         // 📌 GET LOCATION FROM IP
//         const geo = geoip.lookup(ip);
//         const location = geo
//             ? `${geo.city}, ${geo.country}`
//             : "Unknown Location";

//         // 📌 LOGIN TIME
//         const time = new Date().toLocaleString();

//         const existingUser = await prisma.user.findUnique({
//             where: { email_accountType: { email, accountType } }
//         });

//         if (!existingUser) {
//             return res.status(404).json({ success: false, message: "Account Not Found" })
//         };

//         if (!existingUser.isVerified) {
//             const otp = Math.floor(100000 + Math.random() * 900000).toString();

//             await prisma.user.update({
//                 where: { id: existingUser.id },
//                 data: {
//                     otp: otp,
//                     otpExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
//                 }
//             });

//             await sendEmail({
//                 to: email,
//                 type: "otp",
//                 data: { otp }
//             });

//             return res.status(400).json({
//                 success: false,
//                 message: "Account not verified. OTP resent to email."
//             });
//         };

//         const isMatch = await compareHash(password, existingUser.password);

//         if (!isMatch) {
//             res.status(400).status({ success: false, message: "Invalid Password" })
//         };

//         const accessToken = jwt.sign(
//             { userId: existingUser.id, accountType: existingUser.accountType },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRES }
//         );

//         const { password: _, otp, otpExpires, ...userData } = existingUser;

//         await sendEmail({
//             to: email,
//             type: "login",
//             data: {
//                 device: userAgent,
//                 location,
//                 time
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             user: userData,
//             accessToken
//         });
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }

// }

export async function signUp(req, res) {
    try {
        const { accountType, firstName, lastName, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Already an account with this email" });
        }

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

        const otp = await createOTP(user.id, "SIGNUP");

        await sendEmail({
            to: email,
            type: "otp",
            data: { otp }
        });

        res.status(201).json({
            success: true,
            message: "User created. OTP sent to email."
        });

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
            return res.status(404).json({ success: false, message: "Account Not Found" });
        }

        // If not verified → send new OTP
        if (!existingUser.isVerified) {
            const otp = await createOTP(existingUser.id, "SIGNUP");

            await sendEmail({
                to: email,
                type: "otp",
                data: { otp }
            });

            return res.status(400).json({
                success: false,
                message: "Account not verified. OTP resent to email."
            });
        }

        const isMatch = await compareHash(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Password" });
        }

        const accessToken = jwt.sign(
            { userId: existingUser.id, accountType: existingUser.accountType },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        const { password: _, ...userData } = existingUser;

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
        const { email, otp, accountType, type } = req.body;

        const user = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        const otpRecord = await prisma.userOTP.findFirst({
            where: {
                userId: user.id,
                otp,
                type,
                verified: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: "desc" }
        });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        await prisma.userOTP.update({
            where: { id: otpRecord.id },
            data: { verified: true }
        });

        // Only verify account if SIGNUP
        if (type === "SIGNUP") {
            await prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true }
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully."
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


export async function forgotPassword(req, res) {
    try {
        const { email, accountType } = req.body;

        const user = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        const otp = await createOTP(user.id, "PASSWORD_RESET");

        await sendEmail({
            to: email,
            type: "otp",
            data: { otp }
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent to email"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export async function changePassword(req, res) {
    try {
        const { email, accountType, newPassword } = req.body;

        if (!email || !accountType || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, account type and new password are required."
            });
        }

        const user = await prisma.user.findUnique({
            where: { email_accountType: { email, accountType } }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Check if OTP is verified for PASSWORD_RESET
        const otpRecord = await prisma.userOTP.findFirst({
            where: {
                userId: user.id,
                type: "PASSWORD_RESET",
                verified: true
            }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not verified. Please verify the OTP first."
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Invalidate OTP so it cannot be used again
        await prisma.userOTP.update({
            where: { id: otpRecord.id },
            data: { verified: false }
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
