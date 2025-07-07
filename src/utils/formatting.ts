import { Decimal, type DecimalSource } from './decimal'

export function format(value: DecimalSource, precision = 2): string {
  const decimal = new Decimal(value)
  
  if (decimal.lt(1000)) {
    return decimal.toFixed(precision)
  }
  
  if (decimal.lt(1e6)) {
    return decimal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  
  return decimal.toExponential(precision)
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}