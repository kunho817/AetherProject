import Decimal from 'break_infinity.js'

export { Decimal }

export type DecimalSource = Decimal | number | string

export function D(value: DecimalSource): Decimal {
  return new Decimal(value)
}

export const ZERO = D(0)
export const ONE = D(1)
export const TEN = D(10)