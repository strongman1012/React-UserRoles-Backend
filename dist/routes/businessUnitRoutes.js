"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const businessUnitController_1 = require("../controllers/businessUnitController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/businessUnitsList', authenticate_1.checkJwt, businessUnitController_1.getAllBusinessUnitsList);
router.get('/businessUnits', authenticate_1.checkJwt, businessUnitController_1.getAllBusinessUnits);
router.get('/businessUnits/:id', authenticate_1.checkJwt, businessUnitController_1.getBusinessUnit);
router.post('/businessUnits', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Business Units'), businessUnitController_1.createBusinessUnit);
router.put('/businessUnits/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Business Units'), businessUnitController_1.updateBusinessUnit);
router.delete('/businessUnits/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Business Units'), businessUnitController_1.deleteBusinessUnit);
exports.default = router;
//# sourceMappingURL=businessUnitRoutes.js.map