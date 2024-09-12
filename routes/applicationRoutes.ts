import { Router } from 'express';
import { getAllApplications, getApplication, createApplication, updateApplication, deleteApplication } from '../controllers/applicationController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/applications', checkJwt, getAllApplications);
router.get('/applications/:id', checkJwt, getApplication);
router.post('/applications', checkJwt, checkPermission('Applications'), createApplication);
router.put('/applications/:id', checkJwt, checkPermission('Applications'), updateApplication);
router.delete('/applications/:id', checkJwt, checkPermission('Applications'), deleteApplication);

export default router;
