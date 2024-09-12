import { Router } from 'express';
import { getAllDataAccess, getDataAccess, createDataAccess, updateDataAccess, deleteDataAccess, getApplicationAreaAccessLevel } from '../controllers/dataAccessController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/dataAccesses', checkJwt, getAllDataAccess);
router.get('/dataAccesses/:id', checkJwt, getDataAccess);
router.post('/dataAccesses', checkJwt, checkPermission('Data Accesses'), createDataAccess);
router.put('/dataAccesses/:id', checkJwt, checkPermission('Data Accesses'), updateDataAccess);
router.delete('/dataAccesses/:id', checkJwt, checkPermission('Data Accesses'), deleteDataAccess);
router.get('/getApplicationAreaAccessLevel/:area_name', checkJwt, getApplicationAreaAccessLevel);

export default router;
