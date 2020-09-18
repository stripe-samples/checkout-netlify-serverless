# Serverless Stripe Checkout with Netlify Functions

Use Stripe Checkout with Netlify Functions to sell your products online.

## Demo

- https://checkout-netlify-serverless.netlify.com
- [Written tutorial](https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/)
- [Video lessons on egghead](https://jason.af/egghead/stripe-products)
- Live coding session on [learnwithjason.dev](https://www.learnwithjason.dev/sell-products-on-the-jamstack)

<img src="stripe-checkout-netlify-functions-demo.gif" alt="Stripe Checkout with Netlify functions demo gif" align="center">

## Features:

- Load products from a JSON product catalogue
- Create Checkout Sessions with Netlify Functions
- Process Stripe webhook events with Netlify Functions to handle fulfillment

## How to run locally

### Prerequisites

- [Node](https://nodejs.org/en/) >= 10
- [Netlify CLI](https://docs.netlify.com/cli/get-started/#installation)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

Follow the steps below to run locally.

**1. Clone and configure the sample**

```
git clone https://github.com/stripe-samples/checkout-netlify-serverless
```

Copy the .env.example file into a file named .env in the functions folder. For example:

```
cp .env.example .env
```

You will need a Stripe account in order to run the demo. Once you set up your account, go to the Stripe [developer dashboard](https://stripe.com/docs/development/quickstart#api-keys) to find your API keys.

```
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
```

**2. Run Netlify Functions locally:**

You can run the Netlify Functions locally with Netlify Dev:

```
npm run functions
netlify dev
```

**3. [Optional] Run a webhook locally:**

If you want to test the `using-webhooks` integration with a local webhook on your machine, you can use the Stripe CLI to easily spin one up.

Make sure to [install the CLI](https://stripe.com/docs/stripe-cli) and [link your Stripe account](https://stripe.com/docs/stripe-cli#link-account).

In a separate tab run

```
stripe listen --forward-to localhost:8888/.netlify/functions/handle-purchase
```

Or use the shorthand `npm run webhook`

The CLI will print a webhook secret key to the console. Set `STRIPE_WEBHOOK_SECRET` to this value in your .env file.

You should see events logged in the console where the CLI is running.

When you are ready to create a live webhook endpoint, follow our guide in the docs on [configuring a webhook endpoint in the dashboard](https://stripe.com/docs/webhooks/setup#configure-webhook-settings).

### 💫 Deploy with Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/stripe-samples/checkout-netlify-serverless)

## Get support
If you found a bug or want to suggest a new [feature/use case/sample], please [file an issue](../../issues).

If you have questions, comments, or need help with code, we're here to help:
- on [IRC via freenode](https://webchat.freenode.net/?channel=#stripe)
- on Twitter at [@StripeDev](https://twitter.com/StripeDev)
- on Stack Overflow at the [stripe-payments](https://stackoverflow.com/tags/stripe-payments/info) tag
- by [email](mailto:support+github@stripe.com)

## Authors

- [jlengstorf](https://twitter.com/jlengstorf)
- [thorsten-stripe](https://twitter.com/thorwebdev)
