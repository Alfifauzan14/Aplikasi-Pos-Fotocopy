import { PrismaClient, Role, JenisLayanan, UkuranKertas, JenisBahan } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ========================
  // USERS
  // ========================
  const adminPassword = await bcrypt.hash('admin123', 12)
  const manajerPassword = await bcrypt.hash('manajer123', 12)
  const customerPassword = await bcrypt.hash('customer123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fotocopy.com' },
    update: {},
    create: {
      name: 'Admin Fotocopy',
      email: 'admin@fotocopy.com',
      password: adminPassword,
      phone: '081234567890',
      role: Role.ADMIN,
    },
  })

  const manajer = await prisma.user.upsert({
    where: { email: 'manajer@fotocopy.com' },
    update: {},
    create: {
      name: 'Pak Yaqub',
      email: 'manajer@fotocopy.com',
      password: manajerPassword,
      phone: '081234567891',
      role: Role.MANAJER,
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Customer Demo',
      email: 'customer@example.com',
      password: customerPassword,
      phone: '081234567892',
      role: Role.CUSTOMER,
    },
  })

  console.log('✅ Users created:', { admin: admin.email, manajer: manajer.email, customer: customer.email })

  // ========================
  // LAYANAN
  // ========================
  const layanans = [
    // Print Hitam Putih
    { nama: 'Print Hitam Putih A4', jenis: JenisLayanan.PRINT_HITAM_PUTIH, ukuran: UkuranKertas.A4, hargaPerLembar: 500 },
    { nama: 'Print Hitam Putih F4', jenis: JenisLayanan.PRINT_HITAM_PUTIH, ukuran: UkuranKertas.F4, hargaPerLembar: 600 },
    { nama: 'Print Hitam Putih A3', jenis: JenisLayanan.PRINT_HITAM_PUTIH, ukuran: UkuranKertas.A3, hargaPerLembar: 1000 },
    // Print Berwarna
    { nama: 'Print Berwarna A4', jenis: JenisLayanan.PRINT_BERWARNA, ukuran: UkuranKertas.A4, hargaPerLembar: 2000 },
    { nama: 'Print Berwarna F4', jenis: JenisLayanan.PRINT_BERWARNA, ukuran: UkuranKertas.F4, hargaPerLembar: 2500 },
    { nama: 'Print Berwarna A3', jenis: JenisLayanan.PRINT_BERWARNA, ukuran: UkuranKertas.A3, hargaPerLembar: 4000 },
    // Fotocopy
    { nama: 'Fotocopy A4', jenis: JenisLayanan.FOTOCOPY, ukuran: UkuranKertas.A4, hargaPerLembar: 300 },
    { nama: 'Fotocopy F4', jenis: JenisLayanan.FOTOCOPY, ukuran: UkuranKertas.F4, hargaPerLembar: 400 },
    { nama: 'Fotocopy A3', jenis: JenisLayanan.FOTOCOPY, ukuran: UkuranKertas.A3, hargaPerLembar: 800 },
  ]

  for (const layanan of layanans) {
    await prisma.layanan.upsert({
      where: { id: layanan.nama },
      update: { hargaPerLembar: layanan.hargaPerLembar },
      create: layanan,
    })
  }
  console.log('✅ Layanan created')

  // ========================
  // PRODUK ATK
  // ========================
  const produks = [
    { nama: 'Pulpen Ballpoint', deskripsi: 'Pulpen ballpoint hitam kualitas premium', harga: 3000, stok: 100, stokMinimum: 20, satuan: 'pcs' },
    { nama: 'Pensil 2B', deskripsi: 'Pensil 2B untuk menulis dan menggambar', harga: 3000, stok: 80, stokMinimum: 20, satuan: 'pcs' },
    { nama: 'Penggaris 30cm', deskripsi: 'Penggaris plastik 30 cm', harga: 5000, stok: 50, stokMinimum: 10, satuan: 'pcs' },
    { nama: 'Staples Kecil', deskripsi: 'Staples ukuran kecil', harga: 15000, stok: 30, stokMinimum: 10, satuan: 'pcs' },
    { nama: 'Isi Staples', deskripsi: 'Isi staples untuk staples kecil', harga: 5000, stok: 50, stokMinimum: 15, satuan: 'kotak' },
    { nama: 'Map Plastik', deskripsi: 'Map plastik transparan A4', harga: 5000, stok: 60, stokMinimum: 15, satuan: 'pcs' },
    { nama: 'Buku Tulis 58 lembar', deskripsi: 'Buku tulis garis 58 lembar', harga: 8000, stok: 100, stokMinimum: 25, satuan: 'pcs' },
    { nama: 'Amplop Coklat A4', deskripsi: 'Amplop coklat ukuran A4', harga: 3000, stok: 100, stokMinimum: 30, satuan: 'pcs' },
    { nama: 'Tip-X', deskripsi: 'Tip-x cair untuk koreksi tulisan', harga: 8000, stok: 40, stokMinimum: 10, satuan: 'pcs' },
    { nama: 'Isolasi Bening', deskripsi: 'Isolasi bening 2 inci', harga: 5000, stok: 50, stokMinimum: 15, satuan: 'roll' },
  ]

  for (const produk of produks) {
    await prisma.produkATK.upsert({
      where: { id: produk.nama },
      update: { harga: produk.harga, stok: produk.stok },
      create: produk,
    })
  }
  console.log('✅ Produk ATK created')

  // ========================
  // STOK BAHAN
  // ========================
  const stokBahans = [
    { nama: 'Kertas A4', jenis: JenisBahan.KERTAS_A4, satuan: 'rim', stokSaat: 50, stokMinimum: 10 },
    { nama: 'Kertas F4', jenis: JenisBahan.KERTAS_F4, satuan: 'rim', stokSaat: 30, stokMinimum: 8 },
    { nama: 'Kertas A3', jenis: JenisBahan.KERTAS_A3, satuan: 'rim', stokSaat: 20, stokMinimum: 5 },
    { nama: 'Tinta Hitam', jenis: JenisBahan.TINTA, satuan: 'botol', stokSaat: 20, stokMinimum: 5 },
    { nama: 'Tinta Warna', jenis: JenisBahan.TINTA, satuan: 'set', stokSaat: 10, stokMinimum: 3 },
    { nama: 'Toner Hitam', jenis: JenisBahan.TONER, satuan: 'cartridge', stokSaat: 5, stokMinimum: 2 },
  ]

  for (const stok of stokBahans) {
    await prisma.stokBahan.upsert({
      where: { id: stok.nama },
      update: { stokSaat: stok.stokSaat },
      create: stok,
    })
  }
  console.log('✅ Stok Bahan created')

  // ========================
  // PENGATURAN
  // ========================
  const pengaturans = [
    { key: 'nama_toko', value: 'Fotocopy & ATK SMAKZIE' },
    { key: 'alamat_toko', value: 'Jl. Contoh No. 123, Kota Anda' },
    { key: 'telepon_toko', value: '081234567890' },
    { key: 'jam_buka', value: '08:00' },
    { key: 'jam_tutup', value: '17:00' },
    { key: 'qris_image_url', value: '' },
    { key: 'biaya_admin_online', value: '0' },
    { key: 'minimal_lembar_print', value: '1' },
  ]

  for (const setting of pengaturans) {
    await prisma.pengaturan.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Pengaturan created')

  console.log('🎉 Seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@fotocopy.com / admin123')
  console.log('Manajer: manajer@fotocopy.com / manajer123')
  console.log('Customer: customer@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
