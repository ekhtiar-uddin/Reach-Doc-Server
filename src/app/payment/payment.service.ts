import Stripe from "stripe";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const appoitnmentId = session.metadata?.appointmentId;
      const paymentIntentId = session.payment_intent;
      const email = session.customer_email;

      console.log("Payment Successful");
      console.log("Appointment ID:", appoitnmentId);
      console.log("Payment Intent", paymentIntentId);
      console.log("Customer Email", email);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type} `);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
