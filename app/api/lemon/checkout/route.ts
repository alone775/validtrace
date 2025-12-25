import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { createClient } from '@/lib/supabase/server'
import { configureLemonSqueezy } from '@/lib/lemonsqueezy'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    configureLemonSqueezy()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { variantId } = body

    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 })
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is not configured' }, { status: 500 })
    }

    // Create checkout
    const { data, error } = await createCheckout(
      storeId,
      variantId,
      {
        checkoutData: {
          email: user.email,
          custom: {
            user_id: user.id,
          },
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
          receiptButtonText: 'Go to Dashboard',
          receiptThankYouNote: 'Thank you for your purchase!',
        },
      }
    )

    if (error) {
      console.error('Lemon Squeezy Checkout Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ url: data?.data?.attributes?.url })
  } catch (err: any) {
    console.error('Checkout Route Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
