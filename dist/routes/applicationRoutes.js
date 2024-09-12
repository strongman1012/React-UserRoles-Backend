"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationController_1 = require("../controllers/applicationController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/applications', authenticate_1.checkJwt, applicationController_1.getAllApplications);
router.get('/applications/:id', authenticate_1.checkJwt, applicationController_1.getApplication);
router.post('/applications', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Applications'), applicationController_1.createApplication);
router.put('/applications/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Applications'), applicationController_1.updateApplication);
router.delete('/applications/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Applications'), applicationController_1.deleteApplication);
exports.default = router;
//# sourceMappingURL=applicationRoutes.js.map