import { Router } from 'express';
import { getAllLoginReports, getUserMetrics } from '../controllers/loginReportController';
import { checkJwt } from '../middlewares/authenticate';

const router = Router();

router.get('/loginReports', checkJwt, getAllLoginReports);
router.get('/loginReports/:user_id', checkJwt, getUserMetrics)

export default router;
