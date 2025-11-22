import { prisma } from "./prisma.js";

export async function createOTP(userId, type = "SIGNUP") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.userOTP.create({
        data: {
            userId,
            otp,
            type,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        }
    });

    return otp;
}
