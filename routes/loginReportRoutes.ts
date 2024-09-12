import { Router } from 'express';
import { getAllLoginReports, getUserMetrics, getApplicationPerDayMin, getApplicationPerDayNumber, getApplicationTotalPercent, getApplicationCategory } from '../controllers/loginReportController';
import { checkJwt } from '../middlewares/authenticate';

const router = Router();

router.get('/loginReports', checkJwt, getAllLoginReports);
router.get('/loginReports/:user_id', checkJwt, getUserMetrics);
router.get('/metrics/perDayMin', checkJwt, getApplicationPerDayMin);
router.get('/metrics/perDayNumber', checkJwt, getApplicationPerDayNumber);
router.get('/metrics/totalPercent', checkJwt, getApplicationTotalPercent);
router.get('/metrics/category', checkJwt, getApplicationCategory);

export default router;
