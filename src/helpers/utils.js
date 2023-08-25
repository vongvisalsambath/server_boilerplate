import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import crypto from "crypto";

export const createJWT = (data, privateKey) => {
  try {
    return {
      data: jwt.sign(data, privateKey),
      status: 'success'
    }
  } catch (err) {
    return {
      status: 'failed',
      message: 'Cannot create JWT.'
    }
  }
};

export const verifyJWT = (token, privateKey) => {
  try {
    const verificationResults = jwt.verify(token, privateKey);

    return {
      data: verificationResults,
      status: 'success',
    };
  } catch (err) {
    return {
      status: 'failed',
      message: 'Invalid token.',
    }
  }
};

export const encrypt = async (string, secret, iv) => {
  return new Promise((resolve, reject) => {
    try {
      const cipherText = CryptoJS.AES.encrypt(string, secret, { iv });
      resolve(cipherText.toString());
    } catch (err) {
      reject(err);
    }
  });
};

export const decrypt = async (cipherText, secret, iv) => {
  return new Promise((resolve, reject) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secret, { iv });
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      resolve(decrypted);
    } catch (err) {
      reject(err);
    }
  });
};

export const SHA1 = async (text) => {
  const hash = CryptoJS.SHA1(text);
  return hash.toString(CryptoJS.enc.Base64);
};

export const SHA256 = (password, salt) => {
  const hash = crypto
    .createHash("sha256")
    .update(`${password}${salt}`, "utf8")
    .digest("hex");

  return {
    hash,
    salt,
  };
};

export const generateUniqueTransactionReference = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const errorResponse = (res, errorMessage) => {
  let response = {
    data: null,
    message: 'Something went wrong!',
    success: 0,
    status: 'failed'
  };

  if (NODE_ENV === 'development') response.message = errorMessage;

  res.json(response).status(500);
};
