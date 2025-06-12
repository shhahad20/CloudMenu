import { stripeWebhook } from '../src/controllers/WebhookController.js';
export const config = {
    api: {
        bodyParser: false,
    },
};
export default stripeWebhook;
