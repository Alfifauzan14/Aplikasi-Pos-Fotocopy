import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Membuat/Memperbarui akun Admin dan Manajer...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const manajerPassword = await bcrypt.hash('manajer123', 10)

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smakzie.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin Fotocopy',
      email: 'admin@smakzie.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Upsert Manajer
  const manajer = await prisma.user.upsert({
    where: { email: 'manajer@smakzie.com' },
    update: {
      password: manajerPassword,
      role: 'MANAJER',
    },
    create: {
      name: 'Manajer Fotocopy',
      email: 'manajer@smakzie.com',
      password: manajerPassword,
      role: 'MANAJER',
    },
  })

  console.log('✅ Akun Admin berhasil dikonfigurasi:')
  console.log('Email:', admin.email)
  console.log('Password: admin123\n')

  console.log('✅ Akun Manajer berhasil dikonfigurasi:')
  console.log('Email:', manajer.email)
  console.log('Password: manajer123\n')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
