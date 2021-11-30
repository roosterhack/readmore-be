import User from "../models/user";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import express from "express";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";
import Article from "../models/article";
import { subscriptionTypes } from "../utils/subscriptionTypes";

const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
  const user = await User.findOne({ email: req.user });

  const subscriptions = await stripe.subscriptions.list(
    {
      customer: user.customerStripeId,
      status: "all",
      expand: ["data.default_payment_method"],
    },
    {
      apiKey: process.env.STRIPE_SECRET,
    }
  );

  if (!subscriptions.data.length) return res.json([]);

  //@ts-ignore
  const plan = subscriptions.data[0].plan.nickname;

  if (plan === subscriptionTypes.basic) {
    const articles = await Article.find({ access: subscriptionTypes.basic });
    return res.json(articles);
  } else if (plan === subscriptionTypes.standard) {
    const articles = await Article.find({
      access: { $in: [subscriptionTypes.basic, subscriptionTypes.standard] },
    });
    return res.json(articles);
  } else {
    const articles = await Article.find();
    return res.json(articles);
  }

  res.json(plan);
});

export default router;
