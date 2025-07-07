import { Decimal, type DecimalSource } from './decimal'

export function format(value: DecimalSource, precision = 2): string {
  const decimal = new Decimal(value)
  
  if (decimal.lt(1000)) {
    return decimal.toFixed(precision)
  }
  
  if (decimal.lt(1e6)) {
    return decimal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  
  // Custom exponential formatting to remove the + sign
  const exp = decimal.toExponential(precision)
  return exp.replace('e+', 'e')
}

// Special formatting for filament counts - 4-digit limit
export function formatFilamentCount(value: DecimalSource): string {
  const decimal = new Decimal(value)
  
  if (decimal.lt(10000)) {
    return decimal.toFixed(0)
  }
  
  // For values >= 10000, use exponential notation
  const exp = decimal.toExponential(0)
  return exp.replace('e+', 'e')
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}