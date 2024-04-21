export function saveCredentialsToBrowserStorage(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('id', data.id);
    localStorage.setItem('name', data.name);
    localStorage.setItem('image_path', data.image_path);
}

export function getHeader() {
    return {
        "Authorization": localStorage.getItem('token'),
        "Content-Type": "application/json"
    };
}

export function getFormHeader() {
    return {
        "Authorization": localStorage.getItem('token')
    };
}

export function logout() {
    ['token', 'id', 'name', 'image_path'].forEach(key => {
        localStorage.removeItem(key);
    });
}

export function getImage(file, setImage, size) {
    if (file instanceof Blob) {
        const image = new Image(size.width, size.height);
        image.src = URL.createObjectURL(file);
        image.onload = (event) => {
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