import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile } from '@/lib/cloudinary'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
]

const MAX_SIZE = 25 * 1024 * 1024 // 25MB

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        message: 'Format file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, JPG, atau PNG'
      }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'Ukuran file maksimal 25MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, publicId } = await uploadFile(buffer, file.name, 'fotocopy/documents')

    return NextResponse.json({ url, publicId, fileName: file.name, fileSize: file.size })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ message: 'Gagal mengupload file' }, { status: 500 })
  }
}
