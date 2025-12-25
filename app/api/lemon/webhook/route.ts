import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const text = await request.text()
    const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '')
    const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8')
    const signature = Buffer.from(request.headers.get('x-signature') || '', 'utf8')

    if (!crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(text)
    const eventName = payload.meta.event_name
    const data = payload.data.attributes
    const customData = payload.meta.custom_data
    const userId = customData?.user_id

    if (!userId) {
      // If no user_id, we can't update. But maybe it's an update event where we can lookup by subscription_id?
      // For now, let's assume we always pass user_id in custom data or it's stored.
      // Actually, for updates, we might not have custom_data in meta if it wasn't passed again?
      // Lemon Squeezy docs say custom data is persistent.
      // But if not, we should try to find user by subscription_id (customer_id) if we stored it.
      // Let's rely on userId being present or find user by subscription_id in DB.
    }

    const supabase = await createClient()

    // Map common fields
    const subscriptionId = payload.data.id
    const customerId = data.customer_id
    const variantId = data.variant_id
    const status = data.status
    const renewsAt = data.renews_at

    console.log(`Received webhook: ${eventName} for user ${userId} (Sub: ${subscriptionId})`)

    // Determine tier based on variant ID
    let tier = 'free'
    const variantIdStr = variantId.toString()

    if (variantIdStr === process.env.LEMONSQUEEZY_VARIANT_ID_PRO || variantIdStr === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_PRO) {
      tier = 'pro'
    } else if (variantIdStr === process.env.LEMONSQUEEZY_VARIANT_ID_ENTERPRISE || variantIdStr === process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_ENTERPRISE) {
      tier = 'enterprise'
    }

    // If status is not active/on_trial, revert to free?
    // Actually, 'cancelled' might still be active until end of period.
    // We should rely on 'status' and 'renews_at' but for the UI 'tier', 
    // we usually want to show what they have access to.
    // If status is 'expired' or 'unpaid', maybe downgrade.

    if (['expired', 'unpaid'].includes(status)) {
      tier = 'free'
    }

    if (
      eventName === 'subscription_created' ||
      eventName === 'subscription_updated' ||
      eventName === 'subscription_cancelled' ||
      eventName === 'subscription_resumed' ||
      eventName === 'subscription_expired'
    ) {
      // If we have userId, update directly
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_id: subscriptionId,
            customer_id: customerId.toString(),
            variant_id: variantId.toString(),
            subscription_status: status,
            renews_at: renewsAt,
            subscription_tier: tier,
          })
          .eq('id', userId)

        if (error) {
          console.error('Error updating profile:', error)
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
      } else {
        // Try to find by subscription_id
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            renews_at: renewsAt,
            variant_id: variantId.toString(), // In case they upgraded/downgraded
            subscription_tier: tier,
          })
          .eq('subscription_id', subscriptionId)

        if (error) {
          console.error('Error updating profile by sub id:', error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
