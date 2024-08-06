import { Router } from 'express';
import { getAllRoles, getRole, createRole, updateRole, deleteRoles } from '../controllers/roleController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/roles', checkJwt, getAllRoles);
router.get('/roles/:id', checkJwt, getRole);
router.post('/roles', checkJwt, checkPermission('Roles'), createRole);
router.put('/roles/:id', checkJwt, checkPermission('Roles'), updateRole);
router.delete('/roles', checkJwt, checkPermission('Roles'), deleteRoles);

export default router;
