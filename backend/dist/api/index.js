import express from "express";
import "dotenv/config";
import rateLimit from 'express-rate-limit';
import AuthRouter from '../src/routes/AuthRouter.js';
import cors from "cors";
import { config } from "dotenv";
import { supabase } from "../src/config/supabaseClient.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { verifyAuth } from '../src/middleware/verifyAuth.js';
import TemplateRouter from '../src/routes/TemplateRouter.js';
import plansRouter from '../src/routes/plansRouter.js';
config();
const app = express();
const PORT = 4000;
app.use("/public", express.static("public"));
app.use(cookieParser());
// app.use(myLogger)
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
}));
// app.use("/", (req, res) => {
//   res.send("Hello World!");
// });
app.use('/auth', express.json(), AuthRouter);
app.use('/templates', TemplateRouter);
app.use('/plans', plansRouter);
// example of a protected route
app.get('/profiles/me', verifyAuth, async (req, res) => {
    // req is typed as Request, so cast to AuthRequest to get .user
    const { user } = req;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error)
        return res.status(400).json({ error: error.message });
    res.json(data);
});
app.listen(PORT, async () => {
    console.log("Server running http://localhost:" + PORT);
});
