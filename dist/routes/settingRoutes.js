"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingController_1 = require("../controllers/settingController");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.post('/settings', authenticate_1.checkJwt, settingController_1.saveSetting);
exports.default = router;
//# sourceMappingURL=settingRoutes.js.map