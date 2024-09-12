"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataAccessController_1 = require("../controllers/dataAccessController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/dataAccesses', authenticate_1.checkJwt, dataAccessController_1.getAllDataAccess);
router.get('/dataAccesses/:id', authenticate_1.checkJwt, dataAccessController_1.getDataAccess);
router.post('/dataAccesses', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Data Accesses'), dataAccessController_1.createDataAccess);
router.put('/dataAccesses/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Data Accesses'), dataAccessController_1.updateDataAccess);
router.delete('/dataAccesses/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Data Accesses'), dataAccessController_1.deleteDataAccess);
router.get('/getApplicationAreaAccessLevel/:area_name', authenticate_1.checkJwt, dataAccessController_1.getApplicationAreaAccessLevel);
exports.default = router;
//# sourceMappingURL=dataAccessRoutes.js.map