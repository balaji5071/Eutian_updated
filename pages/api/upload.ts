import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max
    });

    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    // Determine resource type
    const isVideo = file.mimetype?.startsWith('video/') || false;
    const resourceType = isVideo ? 'video' : 'image';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'eutian-prototypes',
      resource_type: resourceType,
      transformation: resourceType === 'image' 
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : [
            { quality: 'auto', video_codec: 'auto' },
            { bit_rate: '1m' }, // Limit bitrate to 1 Mbps for faster loading
            { format: 'mp4' }
          ],
    });

    // Delete temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      ok: true,
      url: result.secure_url,
      type: resourceType,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}
