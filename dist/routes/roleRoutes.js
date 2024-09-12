"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/roles', authenticate_1.checkJwt, roleController_1.getAllRoles);
router.get('/roles/:id', authenticate_1.checkJwt, roleController_1.getRole);
router.post('/roles', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Roles'), roleController_1.createRole);
router.put('/roles/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Roles'), roleController_1.updateRole);
router.delete('/roles/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Roles'), roleController_1.deleteRole);
exports.default = router;
//# sourceMappingURL=roleRoutes.js.map