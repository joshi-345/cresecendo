"""
Crescendo — Stripe Integration Service
Manages Stripe checkout sessions, billing portals, and webhook event processing.
"""

from uuid import UUID
import stripe
from app.core.config import settings

# Initialize Stripe API Key
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service to handle Stripe checkout and portal sessions."""

    def __init__(self):
        self.pro_price_id = settings.STRIPE_PRO_PRICE_ID
        self.studio_price_id = settings.STRIPE_STUDIO_PRICE_ID
        self.portal_return_url = settings.STRIPE_PORTAL_RETURN_URL
        self.success_url = f"{settings.FRONTEND_URL}/dashboard/settings?session_id={{CHECKOUT_SESSION_ID}}&success=true"
        self.cancel_url = f"{settings.FRONTEND_URL}/dashboard/settings?success=false"

    def create_checkout_session(
        self,
        user_id: UUID,
        user_email: str,
        tier: str,
    ) -> str:
        """Create a Stripe checkout session for a subscription tier."""
        price_id = None
        if tier == "pro":
            price_id = self.pro_price_id
        elif tier == "studio":
            price_id = self.studio_price_id
        else:
            raise ValueError(f"Invalid subscription tier: {tier}")

        # Check if price ID is configured; if using placeholder, return a mock success URL redirect
        if not price_id or price_id.startswith("price_"):
            # Mock redirect URL for development/testing
            return f"{self.success_url.replace('{CHECKOUT_SESSION_ID}', 'mock_session_id')}&mock=true&tier={tier}"

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=self.success_url,
            cancel_url=self.cancel_url,
            customer_email=user_email,
            metadata={"user_id": str(user_id), "tier": tier},
        )
        return session.url

    def create_portal_session(self, customer_id: str) -> str:
        """Create a Stripe Customer Portal session."""
        if not customer_id or customer_id.startswith("cus_mock"):
            # Mock portal redirect URL for testing
            return self.portal_return_url

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=self.portal_return_url,
        )
        return session.url

    def construct_event(self, payload: bytes, sig_header: str) -> stripe.Event:
        """Construct and verify a Stripe Webhook Event."""
        return stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )


stripe_service = StripeService()
