"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginReportController_1 = require("../controllers/loginReportController");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.get('/loginReports', authenticate_1.checkJwt, loginReportController_1.getAllLoginReports);
router.get('/loginReports/:user_id', authenticate_1.checkJwt, loginReportController_1.getUserMetrics);
router.get('/metrics/perDayMin', authenticate_1.checkJwt, loginReportController_1.getApplicationPerDayMin);
router.get('/metrics/perDayNumber', authenticate_1.checkJwt, loginReportController_1.getApplicationPerDayNumber);
router.get('/metrics/totalPercent', authenticate_1.checkJwt, loginReportController_1.getApplicationTotalPercent);
router.get('/metrics/category', authenticate_1.checkJwt, loginReportController_1.getApplicationCategory);
exports.default = router;
//# sourceMappingURL=loginReportRoutes.js.map