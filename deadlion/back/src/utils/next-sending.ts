export const computeNextSend = (asi: number): Date => {
  const daysRndCnt = asi * (0.5 + Math.random())
  return new Date(Date.now() + daysRndCnt * 24 * 60 * 60 * 1000)
}