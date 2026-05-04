import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV as string,
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  salt_round: process.env.SALT_ROUND,
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  cloudinary: {
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
  },
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
};
