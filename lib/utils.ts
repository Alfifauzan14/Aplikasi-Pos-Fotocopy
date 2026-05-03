import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number | string | null | undefined): string {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateNomorOrder(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString().slice(-8)
  return `${prefix}-${timestamp}`
}

export function generateNomorAntrian(lastNumber: number): string {
  const num = (lastNumber + 1).toString().padStart(3, '0')
  return `A-${num}`
}

export function generateNomorStruk(): string {
  const prefix = 'STR'
  const timestamp = Date.now().toString().slice(-8)
  return `${prefix}-${timestamp}`
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
    PEMBAYARAN_DIKONFIRMASI: 'Pembayaran Dikonfirmasi',
    SEDANG_DIPROSES: 'Sedang Diproses',
    SIAP_DIAMBIL: 'Siap Diambil',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    PEMBAYARAN_DIKONFIRMASI: 'text-blue-600 bg-blue-50 border-blue-200',
    SEDANG_DIPROSES: 'text-purple-600 bg-purple-50 border-purple-200',
    SIAP_DIAMBIL: 'text-green-600 bg-green-50 border-green-200',
    SELESAI: 'text-gray-600 bg-gray-50 border-gray-200',
    DIBATALKAN: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getJenisLayananLabel(jenis: string): string {
  const labels: Record<string, string> = {
    PRINT_HITAM_PUTIH: 'Print Hitam Putih',
    PRINT_BERWARNA: 'Print Berwarna',
    FOTOCOPY: 'Fotocopy',
  }
  return labels[jenis] || jenis
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
