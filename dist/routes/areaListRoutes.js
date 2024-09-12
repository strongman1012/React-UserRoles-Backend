"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const areaListController_1 = require("../controllers/areaListController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/areaList/getSelectedAreas/:role_id', authenticate_1.checkJwt, areaListController_1.getSelectedAreas);
router.post('/areaList/save', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Security Roles'), areaListController_1.saveList);
router.get('/applicationRoles/:role_id', authenticate_1.checkJwt, areaListController_1.getApplicationRoles);
router.post('/applicationRoles/save', authenticate_1.checkJwt, areaListController_1.saveApplicationRoles);
exports.default = router;
//# sourceMappingURL=areaListRoutes.js.map