import express from 'express';
// import mongoose from 'mongoose'
// import mysql from 'mysql'
import cors from 'cors';
import { config } from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import homeRouter from '../src/routers/homeRouter.js';
import userRouter from '../src/routers/userRouter.js';
import authenticationRouter from '../src/routers/authRouter.js';
import pricingRouter from '../src/routers/pricingRouter.js';
import menuRouter from '../src/routers/menuRouter.js';
import FAQsRouter from '../src/routers/FAQsRouter.js';
import sectionRouter from '../src/routers/menuRouters/sectionRouter.js';
import menuItemRouter from '../src/routers/menuRouters/menuItemRouter.js';
import schemaRouter from '../src/routers/userRouters/schemaRouter.js';
import designRequestRoutes from "../src/routers/designRequestRoutes.js";
import componentRouter from "../src/routers/componentRouter.js";
import apiErrorHandler from '../src/middleware/errorHandler.js';
config();
const app = express();
const PORT = 5050;
app.use('/public', express.static('public'));
app.use(cookieParser());
// app.use(myLogger)
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', homeRouter);
app.use('/users', userRouter);
app.use('/auth', authenticationRouter);
app.use('/pricing', pricingRouter);
app.use('/menus', menuRouter);
app.use('/templates', componentRouter);
app.use('/menu/menu-sections', sectionRouter);
app.use('/menu/menu-items', menuItemRouter);
app.use('/FAQs', FAQsRouter);
app.use('/schema', schemaRouter);
app.use('/request-design', designRequestRoutes);
app.use(apiErrorHandler);
app.listen(PORT, async () => {
    console.log('Server running http://localhost:' + PORT);
});
