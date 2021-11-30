import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { checkAuth } from "../middleware/checkAuth";
import { stripe } from "../utils/stripe";

const router = express.Router();

router.post(
  "/signup",
  body("email").isEmail().withMessage("The email is invalid"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("The password is too short"),
  async (req, res) => {
    const validatinErrors = validationResult(req);

    if (!validatinErrors.isEmpty()) {
      const errors = validatinErrors.array().map((error) => {
        return {
          msg: error.msg,
        };
      });

      return res.json({ errors });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        error: [
          {
            msg: "Email has been taken already",
          },
        ],
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await stripe.customers.create(
      {
        email,
      },
      {
        apiKey: process.env.STRIPE_SECRET,
      }
    );

    const newUser = await User.create({
      email,
      password: hashedPassword,
      customerStripeId: customer.id,
    });

    const token = await JWT.sign(
      { email: newUser.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 360000,
      }
    );

    res.json({
      errors: [],
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          customerStripeId: customer.id,
        },
      },
    });
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.json({
      errors: [
        {
          msg: "invalid login details",
        },
      ],
      data: null,
    });
  }

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    res.json({
      errors: [
        {
          msg: "invalid login details",
        },
      ],
      data: null,
    });
  }

  const token = await JWT.sign({ email }, process.env.JWT_SECRET as string, {
    expiresIn: 360000,
  });

  res.json({
    errors: [],
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
});

router.get("/me", checkAuth, async (req, res) => {
  const user = await User.findOne({ email: req.user });

  return res.json({
    errors: [],
    data: {
      user: {
        id: user._id,
        email: user.email,
        customerStripeId: user.customerStripeId,
      },
    },
  });
});

export default router;
