---
title: >
  Automate Order Fulfillment w/Stripe Webhooks & Netlify Functions
description: >
  Send sales from your Jamstack e-commerce site for fulfillment using Stripe webhooks, Netlify Functions, and transaction email from SendGrid.

authors:
  - Jason Lengstorf
  - Thor 雷神
date: 2020-04-21T00:00:00.000Z
lastmod: 2020-04-20T00:00:00.000Z
topics:
  - tutorials
tags:
  - stripe
  - tutorial
  - ecommerce
tweet: ""
format: blog
relatedposts:
  - Learn How to Accept Money on Jamstack Sites in 38 Minutes
  - Create your own URL shortener with Netlify’s Forms and Functions
seo:
  metadescription: >
    Automate Order Fulfillment w/Stripe Webhooks & Netlify Functions
  metatitle: >
    Send sales from your Jamstack e-commerce site for fulfillment using Stripe webhooks, Netlify Functions, and transaction email from SendGrid.
---

When selling products on your Jamstack site you can use Netlify Functions to automate your fulfillment process. In this tutorial, which builds on the code from our previous post, [_Learn How to Accept Money on Jamstack Sites_](https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/?utm_source=blog&utm_medium=stripe-jl&utm_campaign=devex), you'll learn how to **automatically send an email to your fulfillment provider when a payment has been made so that they can send out the goods to your customers.**

For this tutorial, we’ll use [Sendgrid](https://sendgrid.com/) to send transactional emails. You’ll need an account if you’re coding along with us.

> **Heads up!** Sending an email is just one example of an action that you can take when receiving a [webhook from Stripe](https://stripe.com/docs/webhooks). You could also update your database, make a request to your inventory API, or any combination of actions to automate your fulfillment process — the Stripe webhook and Netlify Functions setup will be the same!

## Set up the project

Before we start writing code, we need to make sure we have the appropriate credentials, environment variables, and dependencies to accomplish our task.

### Add your environment variables in Netlify

To your [Netlify dashboard](https://app.netlify.com), head to your "Deploy settings" under "Environment" add the following variables which we need to handle the webhook events and send emails with Sendgrid:

| Variable                    | Description                                                         |
| :-------------------------- | :------------------------------------------------------------------ |
| `SENDGRID_API_KEY`          | [Your SendGrid API key](https://app.sendgrid.com/settings/api_keys) |
| `FULFILLMENT_EMAIL_ADDRESS` | The email address of your fulfillment provider                      |
| `FROM_EMAIL_ADDRESS`        | Your email address that SendGrid will send the email from           |
| `STRIPE_WEBHOOK_SECRET`     | Your Stripe webhook secret. Read below how to create it                    |


### Install dependencies

Next, install the `stripe` and `@sendgrid/mail` as dependencies for our functions:

```bash
# move into the functions directory
cd functions/

# install Stripe & SendGrid
npm i stripe && npm i @sendgrid/mail

# move back to the project root
cd ..
```

## Create a serverless function to receive the webhook event and send the email

In your functions folder, create a new file: `functions/handle-purchase.js`. This function will:

1. receive the Stripe webhook event, (a `POST` request sent from Stripe when the payment was successful),
2. verify that the request is legitimate,
3. extract the purchase details, and
4. send them via email to our fulfillment provider.

<span></span>

```js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async ({ body, headers }) => {
  try {
    // check the webhook to make sure it’s valid
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // only do stuff if this is a successful Stripe Checkout purchase
    if (stripeEvent.type === 'checkout.session.completed') {
      const eventObject = stripeEvent.data.object;
      const items = eventObject.display_items;
      const shippingDetails = eventObject.shipping;

      // Send and email to our fulfillment provider using Sendgrid.
      const purchase = { items, shippingDetails };
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
```

### Why do we need to verify the webhook signature?

Since this will instruct our fulfillment provider to send out physical goods, we need to make sure that this request was actually sent by Stripe and not created by a malicious third-party.

For this we use our `STRIPE_WEBHOOK_SECRET` and the `stripe.webhooks.constructEvent` helper from stripe-node. When testing locally, the webhook secret will be returned to you by the Stripe CLI, otherwise you will retrieve the webhook secret from the Stripe Dashboard when creating your production webhook endpoint.

## Forward webhook events to your local server with the Stripe CLI

In the [previous tutorial](https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/?utm_source=blog&utm_medium=stripe-jl&utm_campaign=devex), we learned how to run functions locally using `ntl dev`. Testing webhook events locally can be challenging since your local server (`localhost`) is not reachable via the internet.

To make local development and testing possible, Stripe provides a CLI that allows you to forward webhook events to a server running locally.

[Install the CLI](https://stripe.com/docs/stripe-cli) and [link your Stripe account](https://stripe.com/docs/stripe-cli#link-account).

Open a second terminal window since this needs to be running at the same time as your development site, then start the Stripe CLI with the following command:

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/handle-purchase
```

The CLI will print a webhook secret key to the console. Set `STRIPE_WEBHOOK_SECRET` to this value in your Netlify "Deploy settings" under "Environment".

> **Heads up!** After setting the webhook secret in your Netlify dashboard you will need to stop and restart `ntl dev` for it to be available locally.

## Deploy to production

When you're ready to move things to live mode, add a new webhook endpoint in your [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

- Endpoint URL: https://your-domain.com/.netlify/functions/handle-purchase
- Events to send: `checkout.session.completed`

![Add webhook endpoint screenshot](/img/blog/stripe-add-webhook.png)

After you click the "Add endpoint" button, you will see your webhook details, including a panel to reveal the webhook secret.

![Webhook details screenshot](/img/blog/stripe-webhook-secret.png)

Click the "Click to reveal" button and copy the webhook secret to your Netlify environment settings as the `STRIPE_WEBHOOK_SECRET` variable.

> **Heads up!** After setting the webhook secret in your Netlify dashboard you will need to redeploy your site for it to be available in your function.

Once your functions finish deploying, you’re up and running! All successful purchases will now be sent to this function by a Stripe webhook and your fulfillment center will automatically be notified of new sales!

## What to do next

For more information, check out [the source code](https://github.com/stripe-samples/checkout-netlify-serverless/blob/master/functions/handle-purchase.js) for this example and give it a try!

How will you use webhook notifications to power your e-commerce Jamstack site? [Let us know on Twitter!](https://twitter.com/compose/tweet?text=I%20just%20read%20@jlengstorf%20and%20@thorwebdev%E2%80%99s%20article%20on%20sending%20fulfillment%20emails%20for%20each%20sale%20using%20@sendgrid,%20@stripe%20webhooks,%20and%20@netlify%20Functions&url=https://www.netlify.app/blog/2020/04/21/automate-order-fulfillment-w/stripe-webhooks-netlify-functions/?utm_source=twitter%26utm_medium=stripe-jamstack-webhooks-jl%26utm_campaign=devex)
