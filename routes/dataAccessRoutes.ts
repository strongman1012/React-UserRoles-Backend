import { Router } from 'express';
import { getAllDataAccess, getDataAccess, createDataAccess, updateDataAccess, deleteDataAccess } from '../controllers/dataAccessController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/dataAccesses', checkJwt, getAllDataAccess);
router.get('/dataAccesses/:id', checkJwt, getDataAccess);
router.post('/dataAccesses', checkJwt, checkPermission('Data Accesses'), createDataAccess);
router.put('/dataAccesses/:id', checkJwt, checkPermission('Data Accesses'), updateDataAccess);
router.delete('/dataAccesses', checkJwt, checkPermission('Data Accesses'), deleteDataAccess);

export default router;
