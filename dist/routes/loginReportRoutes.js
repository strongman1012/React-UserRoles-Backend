"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginReportController_1 = require("../controllers/loginReportController");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.get('/loginReports', authenticate_1.checkJwt, loginReportController_1.getAllLoginReports);
router.get('/loginReports/:user_id', authenticate_1.checkJwt, loginReportController_1.getUserMetrics);
exports.default = router;
//# sourceMappingURL=loginReportRoutes.js.map