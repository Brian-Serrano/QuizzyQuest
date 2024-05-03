import { secureStorage } from "./secureStorage";

export function saveCredentialsToBrowserStorage(data) {
    secureStorage.setItem('user', {
        token: data.token,
        id: data.id,
        name: data.name,
        image_path: data.image_path
    });
}

export function appendAnswerQuizForUnauthUsers(id) {
    const prevQuiz = secureStorage.getItem('quiz');
    secureStorage.setItem('quiz', prevQuiz ? [...prevQuiz, id] : [id]);
}

export function getHeader() {
    return {
        "Authorization": secureStorage.getItem('user').token,
        "Content-Type": "application/json"
    };
}

export function getFormHeader() {
    return {
        "Authorization": secureStorage.getItem('user').token
    };
}

export function logout() {
    secureStorage.removeItem('user');
}

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