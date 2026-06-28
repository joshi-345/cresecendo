"""
Crescendo — Billing & Subscription Routes
"""

from fastapi import APIRouter, HTTPException, status, Request, Depends
from sqlalchemy import select

from app.api.dependencies import DbSession, CurrentUser
from app.models.user import User
from app.schemas.billing import CheckoutRequest, SessionUrlResponse
from app.services.stripe_service import stripe_service

router = APIRouter()


@router.post("/checkout", response_model=SessionUrlResponse)
async def create_checkout_session(
    data: CheckoutRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a Stripe checkout session to subscribe to Pro or Studio tier."""
    try:
        checkout_url = stripe_service.create_checkout_session(
            user_id=current_user.id,
            user_email=current_user.email,
            tier=data.tier,
        )
        return SessionUrlResponse(url=checkout_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/portal", response_model=SessionUrlResponse)
async def create_portal_session(
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a Stripe Customer Portal session for subscription management."""
    customer_id = current_user.stripe_customer_id
    if not customer_id:
        # If user hasn't checkout yet, return mock settings redirect or raise error
        customer_id = "cus_mock_fallback"

    try:
        portal_url = stripe_service.create_portal_session(customer_id)
        return SessionUrlResponse(url=portal_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: DbSession):
    """Process incoming Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe-Signature header",
        )

    try:
        event = stripe_service.construct_event(payload, sig_header)
    except Exception as e:
        print(f"[BillingWebhook] Webhook signature verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook verification failed: {e}",
        )

    event_type = event.get("type")
    print(f"[BillingWebhook] Processing event: {event_type}")

    # 1. Checkout session completed (initial subscription)
    if event_type == "checkout.session.completed":
        session = event.data.object
        metadata = session.get("metadata", {})
        user_id_str = metadata.get("user_id")
        tier = metadata.get("tier", "free")

        if user_id_str:
            try:
                import uuid
                user_uuid = uuid.UUID(user_id_str)
                result = await db.execute(select(User).where(User.id == user_uuid))
                user = result.scalar_one_or_none()

                if user:
                    user.stripe_customer_id = session.get("customer")
                    user.stripe_subscription_id = session.get("subscription")
                    user.subscription_tier = tier
                    await db.commit()
                    print(f"[BillingWebhook] Updated user {user.email} to tier {tier}")
            except Exception as e:
                print(f"[BillingWebhook] Failed to update user after checkout: {e}")

    # 2. Subscription updated (upgrade/downgrade)
    elif event_type == "customer.subscription.updated":
        subscription = event.data.object
        customer_id = subscription.get("customer")
        
        # Determine tier from subscription items
        # Usually metadata contains 'tier' if set, else check price ID
        metadata = subscription.get("metadata", {})
        tier = metadata.get("tier")
        
        # Fallback: check price ID in subscription items
        if not tier:
            items = subscription.get("items", {}).get("data", [])
            if items:
                price_id = items[0].get("price", {}).get("id")
                from app.core.config import settings
                if price_id == settings.STRIPE_PRO_PRICE_ID:
                    tier = "pro"
                elif price_id == settings.STRIPE_STUDIO_PRICE_ID:
                    tier = "studio"

        if customer_id and tier:
            result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
            user = result.scalar_one_or_none()
            if user:
                user.subscription_tier = tier
                user.stripe_subscription_id = subscription.get("id")
                await db.commit()
                print(f"[BillingWebhook] Subscription updated: User {user.email} tier is now {tier}")

    # 3. Subscription deleted (cancelled)
    elif event_type == "customer.subscription.deleted":
        subscription = event.data.object
        subscription_id = subscription.get("id")

        if subscription_id:
            result = await db.execute(select(User).where(User.stripe_subscription_id == subscription_id))
            user = result.scalar_one_or_none()
            if user:
                user.subscription_tier = "free"
                user.stripe_subscription_id = None
                await db.commit()
                print(f"[BillingWebhook] Subscription cancelled: User {user.email} reverted to free tier")

    return {"status": "success"}
