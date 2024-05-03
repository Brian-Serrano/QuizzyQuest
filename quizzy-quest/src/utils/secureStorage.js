import CryptoJS from "crypto-js";
import SecureStorage from "secure-web-storage";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
 
export const secureStorage = new SecureStorage(localStorage, {
    hash: (key) => CryptoJS.SHA256(key, SECRET_KEY).toString(),
    encrypt: (data) => {
        console.log(CryptoJS.AES.encrypt(data, SECRET_KEY).toString());
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    },
    decrypt: (data) => {
        console.log(CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8));
        return CryptoJS.AES.decrypt(data, SECRET_KEY).toString(CryptoJS.enc.Utf8);
    }
});