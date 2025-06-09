import express from "express";
import "dotenv/config";

import rateLimit from 'express-rate-limit';
import AuthRouter from '../src/routes/AuthRouter.js';

import cors from "cors";
import { config } from "dotenv";
import { supabase } from "../src/config/supabaseClient.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { verifyAuth, AuthRequest } from '../src/middleware/verifyAuth.js';
import TemplateRouter from '../src/routes/TemplateRouter.js';
import PlansRouter from '../src/routes/PlansRouter.js';
import CheckoutRouter from '../src/routes/ChecoutRouter.js';
import WebhookRouter from '../src/routes/WebhookRouter.js';
import ContactRouter from '../src/routes/ContactRouter.js';
import InvoicesRouter from '../src/routes/InvoiceRouter.js';
import {  getAnalytics } from "../src/controllers/UsgaeController.js";

config();
const app = express();
const PORT = 4000;

app.use("/public", express.static("public"));

app.use(cookieParser());
// app.use(myLogger)
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use('/webhook', WebhookRouter);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
}));


app.get("/", (req, res) => {
  res.send("Hi there! Welcome to the Cloud Menu API.");
});

app.use('/auth',express.json(), AuthRouter);
app.use('/templates', TemplateRouter);
app.use('/plans', PlansRouter);
app.use('/checkout', CheckoutRouter);
app.use('/contact', ContactRouter);
app.use('/invoices', InvoicesRouter);
// in your routes file
// app.get('/usage/total', verifyAuth, getTotalUsage);
app.get('/usage/analytics', verifyAuth, getAnalytics );

// example of a protected route
app.get('/profiles/me', verifyAuth, async (req, res) => {
  // req is typed as Request, so cast to AuthRequest to get .user
  const { user } = req as unknown as AuthRequest;
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, async () => {
  console.log("Server running http://localhost:" + PORT);
});

export default app;