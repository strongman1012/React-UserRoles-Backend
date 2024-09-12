import { Router } from 'express';
import { getAllBusinessUnitsList, getAllBusinessUnits, getBusinessUnit, createBusinessUnit, updateBusinessUnit, deleteBusinessUnit } from '../controllers/businessUnitController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/businessUnitsList', checkJwt, getAllBusinessUnitsList);
router.get('/businessUnits', checkJwt, getAllBusinessUnits);
router.get('/businessUnits/:id', checkJwt, getBusinessUnit);
router.post('/businessUnits', checkJwt, checkPermission('Business Units'), createBusinessUnit);
router.put('/businessUnits/:id', checkJwt, checkPermission('Business Units'), updateBusinessUnit);
router.delete('/businessUnits/:id', checkJwt, checkPermission('Business Units'), deleteBusinessUnit);

export default router;
