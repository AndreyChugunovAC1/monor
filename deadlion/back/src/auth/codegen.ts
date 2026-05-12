import { base32Encode } from "@ctrl/ts-base32"

export const genCode = (): string => {
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

export const genSecret = (): string => {
  const bytes = new Uint8Array(15)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}