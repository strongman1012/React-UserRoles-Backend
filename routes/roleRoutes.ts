import { Router } from 'express';
import { getAllRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/roleController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/roles', checkJwt, getAllRoles);
router.get('/roles/:id', checkJwt, getRole);
router.post('/roles', checkJwt, checkPermission('Security Roles'), createRole);
router.put('/roles/:id', checkJwt, checkPermission('Security Roles'), updateRole);
router.delete('/roles/:id', checkJwt, checkPermission('Security Roles'), deleteRole);

export default router;
