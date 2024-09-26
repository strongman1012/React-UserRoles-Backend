import dotenv from 'dotenv';
dotenv.config({ path: '.env.userrole' });
import express, { Request, Response } from 'express';
import cors from 'cors';
import passport from './config/passport';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import areaListRoutes from './routes/areaListRoutes';
import roleRoutes from './routes/roleRoutes';
import applicationRoutes from './routes/applicationRoutes';
import areaRoutes from './routes/areaRoutes';
import businessUnitRoutes from './routes/businessUnitRoutes';
import teamRoutes from './routes/teamRoutes';
import dataAccessRoutes from './routes/dataAccessRoutes';
import loginReportRoutes from './routes/loginReportRoutes';
import settingRoutes from './routes/settingRoutes';
import config from './config/config';
import path from "path";

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
// app.use(express.static("../client/build"));

const API_VERSION = 'v0';
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, areaListRoutes);
app.use(`/api/${API_VERSION}`, roleRoutes);
app.use(`/api/${API_VERSION}`, applicationRoutes);
app.use(`/api/${API_VERSION}`, areaRoutes);
app.use(`/api/${API_VERSION}`, businessUnitRoutes);
app.use(`/api/${API_VERSION}`, teamRoutes);
app.use(`/api/${API_VERSION}`, dataAccessRoutes);
app.use(`/api/${API_VERSION}`, loginReportRoutes);
app.use(`/api/${API_VERSION}`, settingRoutes);

// // Catch-all route to serve the client's index.html file
// app.get("*", (req: Request, res: Response) => {
// 	res.sendFile(path.resolve("../client/build/" + "index.html"));
// });

const PORT = config.port;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
