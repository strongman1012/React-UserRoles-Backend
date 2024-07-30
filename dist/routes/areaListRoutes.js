"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const areaListController_1 = require("../controllers/areaListController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.post('/areaList/getAll', authenticate_1.checkJwt, areaListController_1.getAllList);
router.post('/areaList/save', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Security Roles'), areaListController_1.saveList);
exports.default = router;
//# sourceMappingURL=areaListRoutes.js.map