/*
 * This function implements a Stripe webhook handler to handle
 * fulfillment for our successful payments.
 *
 * @see https://stripe.com/docs/payments/checkout/fulfillment#webhooks
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async ({ body, headers }) => {
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (stripeEvent.type === 'checkout.session.completed') {
      const eventObject = stripeEvent.data.object;
      const items = eventObject.display_items;
      const shippingDetails = eventObject.shipping;

      // Here make an API call / send an email to your fulfillment provider.
      const purchase = { items, shippingDetails };
      console.log(`📦 Fulfill purchase:`, JSON.stringify(purchase, null, 2));
      // Send and email to our fulfillment provider using Sendgrid.
      const msg = {
        to: process.env.FULFILLMENT_EMAIL_ADDRESS,
        from: process.env.FROM_EMAIL_ADDRESS,
        subject: `New purchase from ${shippingDetails.name}`,
        text: JSON.stringify(purchase, null, 2),
      };
      await sgMail.send(msg);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.log(`Stripe webhook failed with ${err}`);

    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};
