import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Mengosongkan semua riwayat orderan...')
  
  // Hapus semua data yang berhubungan dengan order
  await prisma.struk.deleteMany()
  await prisma.antrian.deleteMany()
  await prisma.orderDetailLayanan.deleteMany()
  await prisma.orderDetailATK.deleteMany()
  
  // Hapus semua order
  const deletedOrders = await prisma.order.deleteMany()
  
  console.log(`Berhasil menghapus ${deletedOrders.count} order beserta semua relasinya.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
