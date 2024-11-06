const crypto = require('crypto');

class CryptoFeatures {

    static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
        ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
        : null;
    static IV_LENGTH = 16;

    static encrypt(text) {
        if (!CryptoFeatures.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not set or invalid.');
        }

        const iv = crypto.randomBytes(CryptoFeatures.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', CryptoFeatures.ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
      
    static decrypt(text) {
        if (!CryptoFeatures.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not set or invalid.');
        }
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', CryptoFeatures.ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

module.exports = CryptoFeatures;

