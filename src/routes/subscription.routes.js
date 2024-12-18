import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes
router.use(verifyJWT);

// Route for toggling subscription (subscribe/unsubscribe to a channel)
router.route("/c/:channelId").post(toggleSubscription);

// Route for getting all subscriptions of the logged-in user
router.route("/subscriptions").get(getSubscribedChannels);

// Route for getting all subscribers of a specific channel
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

export default router;
