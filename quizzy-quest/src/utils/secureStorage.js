import CryptoJS from "crypto-js";
import SecureStorage from "secure-web-storage";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
 
export const secureStorage = new SecureStorage(localStorage, {
    hash: (key) => CryptoJS.SHA256(key, SECRET_KEY).toString(),
    encrypt: (data) => {
        console.log(SECRET_KEY);
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
    },
    decrypt: (data) => CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8)
});