import express from 'express';
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
import config from './config/config';

const app = express();
const corsOptions = {
    origin: '*', // Adjust this to restrict access if needed
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'], // Ensure GET is listed here
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

const API_VERSION = 'v0';
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, areaListRoutes);
app.use(`/api/${API_VERSION}`, roleRoutes);
app.use(`/api/${API_VERSION}`, applicationRoutes);
app.use(`/api/${API_VERSION}`, areaRoutes);
app.use(`/api/${API_VERSION}`, businessUnitRoutes);

const PORT = config.port;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
