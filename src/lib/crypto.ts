const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY is not set");
  return key;
}

async function deriveKey(
  secret: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// フォーマット: [salt(16)] [iv(12)] [ciphertext]
export async function encrypt(data: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(getEncryptionKey(), salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(data)
  );
  const cipherBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + cipherBytes.length
  );
  combined.set(salt);
  combined.set(iv, SALT_LENGTH);
  combined.set(cipherBytes, SALT_LENGTH + IV_LENGTH);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encoded: string): Promise<string> {
  const combined = new Uint8Array(
    atob(encoded)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const data = combined.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(getEncryptionKey(), salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}
