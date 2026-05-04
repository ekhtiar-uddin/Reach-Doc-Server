import { Request, Response } from "express";
import config from "../../config";
import { stripe } from "../helper/stripe";
import catchAsync from "../shared/catchAsync";
import sendResponse from "../shared/sendResponse";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.stripWebhookSecret;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("WEbhook signature varification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message} `);
    }

    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "webhook request sent successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
