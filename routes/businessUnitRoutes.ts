import { Router } from 'express';
import { getChildBusinessUnits, getAllBusinessUnits, getBusinessUnit, createBusinessUnit, updateBusinessUnit, deleteBusinessUnit } from '../controllers/businessUnitController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/childBusinessUnits/:id', checkJwt, getChildBusinessUnits);
router.get('/businessUnits', checkJwt, getAllBusinessUnits);
router.get('/businessUnits/:id', checkJwt, getBusinessUnit);
router.post('/businessUnits', checkJwt, checkPermission('Business Units'), createBusinessUnit);
router.put('/businessUnits/:id', checkJwt, checkPermission('Business Units'), updateBusinessUnit);
router.delete('/businessUnits', checkJwt, checkPermission('Business Units'), deleteBusinessUnit);

export default router;
