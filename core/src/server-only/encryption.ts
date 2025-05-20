import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCODING = "base64";

/**
 * Encrypts a JSON object using AES-256-CBC encryption algorithm.
 *
 * This function takes a JSON object and an encryption key in base64 format,
 * encrypts the JSON object using AES-256-CBC, and returns the encrypted data as a base64 encoded string,
 * prefixed with the base64 encoded initialization vector.
 *
 * Example:
 * ```
 * const key = "your-base64-encoded-256-bit-key";
 * const data = { message: "Hello, world!" };
 * encrypt(data, key).then(encryptedData => console.log(encryptedData));
 * ```
 *
 * @param json - The JSON object to encrypt.
 * @param key - The encryption key in base64 format. Must be 32 bytes (256 bits) when decoded.
 * @returns A Promise that resolves to a string containing the encrypted data.
 */
export async function encrypt<JSON>(json: JSON, key: string): Promise<string> {
  const initializationVector = randomBytes(16); // AES block size is 16 bytes
  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(key, "base64"),
    initializationVector
  );
  let encrypted = cipher.update(JSON.stringify(json), "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);
  return `${initializationVector.toString(ENCODING)}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with the AES-256-CBC encryption algorithm.
 *
 * This function takes an encrypted string, which includes the encrypted data,
 * and a decryption key in base64 format.
 * It decrypts the data and returns the original JSON object.
 *
 * Example:
 * ```
 * const key = "your-base64-encoded-256-bit-key";
 * const encryptedData = "base64IV:base64EncryptedData";
 * decrypt(encryptedData, key).then(decryptedData => console.log(decryptedData));
 * ```
 *
 * @param encrypted - The encrypted data.
 * @param key - The decryption key in base64 format. Must be 32 bytes (256 bits) when decoded.
 * @returns A Promise that resolves to the decrypted JSON object.
 */
export async function decrypt<JSON>(
  encrypted: string,
  key: string
): Promise<JSON> {
  const [base64initializationVector, base64EncryptedData] =
    encrypted.split(":");
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key, "base64"),
    Buffer.from(base64initializationVector, ENCODING)
  );
  let decrypted = decipher.update(base64EncryptedData, ENCODING, "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}
