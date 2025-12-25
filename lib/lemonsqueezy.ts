import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  if (!apiKey) {
    console.error('LEMONSQUEEZY_API_KEY is not set')
    // We don't throw here to avoid crashing build time if env is missing,
    // but runtime calls will fail or we can throw inside specific functions.
    return
  }

  lemonSqueezySetup({ apiKey })
}
