require('dotenv').config();

const cloudinary = require('cloudinary').v2;

// Parse CLOUDINARY_URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
function parseCloudinaryUrl(url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!match) {
        throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>');
    }
    return {
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3]
    };
}

const config = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
cloudinary.config(config);

async function uploadImage(buffer, folder = 'sugar-blush') {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        ).end(buffer);
    });
}

async function deleteImage(publicId) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

module.exports = { uploadImage, deleteImage, cloudinary };
