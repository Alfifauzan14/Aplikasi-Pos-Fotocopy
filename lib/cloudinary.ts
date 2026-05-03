import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadFile(file: Buffer, filename: string, folder: string = 'fotocopy') {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    // Fallback mock jika API Key belum diisi (untuk keperluan testing lokal)
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('your-cloudinary')) {
      console.warn('Cloudinary keys not set. Returning mock file URL.')
      return resolve({ 
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', 
        publicId: `mock_${Date.now()}` 
      })
    }

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder,
        public_id: `${folder}/${Date.now()}-${filename}`,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve({ url: result!.secure_url, publicId: result!.public_id })
      }
    ).end(file)
  })
}

export async function deleteFile(publicId: string) {
  if (publicId.startsWith('mock_') || !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('your-cloudinary')) {
    return Promise.resolve()
  }
  return cloudinary.uploader.destroy(publicId)
}
