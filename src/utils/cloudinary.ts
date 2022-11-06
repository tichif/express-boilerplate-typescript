import cloudinary from 'cloudinary';

import config from '../config';
import Logging from './log';

// @ts-ignore
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

// add image
export async function uploadImage(
  image: string,
  folder: string = 'tkboutique/images'
) {
  try {
    const result = await cloudinary.v2.uploader.upload(image, {
      folder,
      width: '1200',
      crop: 'scale',
    });
    return result;
  } catch (error: any) {
    Logging.error(error.message);
  }
}

// delete image
export async function deleteImage(public_id: string) {
  try {
    await cloudinary.v2.uploader.destroy(public_id);
  } catch (error: any) {
    Logging.error(error.message);
  }
}
