import bcrypt from "bcryptjs";

export async function hashPassword(plainText, saltRounds = 10){
  const hashed = await bcrypt.hash(plainText, saltRounds);
  return hashed;
}

export async function compareHash(plainText, hashedText) {
  const match = await bcrypt.compare(plainText, hashedText);
  return match;
}
