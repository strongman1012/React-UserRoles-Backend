"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const areaController_1 = require("../controllers/areaController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/areas', authenticate_1.checkJwt, areaController_1.getAllAreas);
router.get('/areas/:id', authenticate_1.checkJwt, areaController_1.getArea);
router.post('/areas', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Areas'), areaController_1.createArea);
router.put('/areas/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Areas'), areaController_1.updateArea);
router.delete('/areas/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Areas'), areaController_1.deleteArea);
exports.default = router;
//# sourceMappingURL=areaRoutes.js.map