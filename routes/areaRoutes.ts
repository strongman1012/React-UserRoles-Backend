import { Router } from 'express';
import { getAllAreas, getArea, createArea, updateArea, deleteArea } from '../controllers/areaController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/areas', checkJwt, getAllAreas);
router.get('/areas/:id', checkJwt, getArea);
router.post('/areas', checkJwt, checkPermission('Areas'), createArea);
router.put('/areas/:id', checkJwt, checkPermission('Areas'), updateArea);
router.delete('/areas/:id', checkJwt, checkPermission('Areas'), deleteArea);

export default router;
