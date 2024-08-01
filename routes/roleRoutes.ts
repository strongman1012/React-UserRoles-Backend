import { Router } from 'express';
import { getAreaAccessLevel, getAllRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/roleController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/areaAccessLevel/:user_role_id/:area_name', checkJwt, getAreaAccessLevel);
router.get('/roles', checkJwt, getAllRoles);
router.get('/roles/:id', checkJwt, getRole);
router.post('/roles', checkJwt, checkPermission('Security Roles'), createRole);
router.put('/roles/:id', checkJwt, checkPermission('Security Roles'), updateRole);
router.delete('/roles/:id', checkJwt, checkPermission('Security Roles'), deleteRole);

export default router;
