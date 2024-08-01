import { Router } from 'express';
import { getAllDataAccess, getDataAccess, createDataAccess, updateDataAccess, deleteDataAccess } from '../controllers/dataAccessController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/dataAccesses', checkJwt, getAllDataAccess);
router.get('/dataAccesses/:id', checkJwt, getDataAccess);
router.post('/dataAccesses', checkJwt, checkPermission('Data Access'), createDataAccess);
router.put('/dataAccesses/:id', checkJwt, checkPermission('Data Access'), updateDataAccess);
router.delete('/dataAccesses', checkJwt, checkPermission('Data Access'), deleteDataAccess);

export default router;
