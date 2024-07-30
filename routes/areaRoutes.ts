import { Router } from 'express';
import { getAllAreas, getArea, createArea, updateArea, deleteArea } from '../controllers/areaController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/areas', checkJwt, getAllAreas);
router.get('/areas/:id', checkJwt, getArea);
router.post('/areas', checkJwt, checkPermission('Security Roles'), createArea);
router.put('/areas/:id', checkJwt, checkPermission('Security Roles'), updateArea);
router.delete('/areas/:id', checkJwt, checkPermission('Security Roles'), deleteArea);

export default router;
