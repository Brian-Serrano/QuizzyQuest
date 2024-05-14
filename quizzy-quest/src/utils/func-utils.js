import { secureStorage } from "./secureStorage";

/**
 * Save user information in the browser local storage (encrypt it too)
 * @param {object} data User information (received from server after successful login/signup)
 */
export function saveCredentialsToBrowserStorage(data) {
    secureStorage.setItem('user', {
        token: data.token,
        id: data.id,
        name: data.name,
        image_path: data.image_path
    });
}

/**
 * Add the quiz id to the browser local storage (encrypt it too), used to check if quiz is answered so unauthorized users can not spam answering quizzes
 * @param {number} id The id to add to local storage
 */
export function appendAnswerQuizForUnauthUsers(id) {
    const prevQuiz = secureStorage.getItem('quiz');
    secureStorage.setItem('quiz', prevQuiz ? [...prevQuiz, id] : [id]);
}

/**
 * Get the header for authorized routes that are in JSON content-type
 * @returns Header for the request
 */
export function getHeader() {
    return {
        "Authorization": secureStorage.getItem('user').token,
        "Content-Type": "application/json"
    };
}

/**
 * Get the header for authorized routes that are form data content-type
 * @returns Header for the request
 */
export function getFormHeader() {
    return {
        "Authorization": secureStorage.getItem('user').token
    };
}

/**
 * Clear the user information/data in browser local storage, used when the user will logout
 */
export function logout() {
    secureStorage.removeItem('user');
}

/**
 * Get the squeezed/scaled image from file (should be image) parameter base on size parameter that will be received in the setImage callback
 * @param {blob?} file Should be a blob/file object and an image
 * @param {function(blob?, string): void} setImage A callback function that contains the result image (squeezed/scaled according to the size parameter) and image src, and should use/add this to state inside callback.
 * @param {object} size An object that contains width and height
 */
export function getImage(file, setImage, size) {
    if (file instanceof Blob) {
        const image = new Image(size.width, size.height);
        image.src = URL.createObjectURL(file);
        image.onload = (_) => {
            const canvas = document.createElement("canvas");
            canvas.width = size.width;
            canvas.height = size.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, size.width, size.height);
            canvas.toBlob((blob) => {
                setImage(blob, image.src);
            });
        };
    } else {
        setImage(null, "");
    }
}