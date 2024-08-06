import { Router } from 'express';
import { getAllBusinessUnits, getBusinessUnit, createBusinessUnit, updateBusinessUnit, deleteBusinessUnits } from '../controllers/businessUnitController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/businessUnits', checkJwt, getAllBusinessUnits);
router.get('/businessUnits/:id', checkJwt, getBusinessUnit);
router.post('/businessUnits', checkJwt, checkPermission('Business Units'), createBusinessUnit);
router.put('/businessUnits/:id', checkJwt, checkPermission('Business Units'), updateBusinessUnit);
router.delete('/businessUnits', checkJwt, checkPermission('Business Units'), deleteBusinessUnits);

export default router;
