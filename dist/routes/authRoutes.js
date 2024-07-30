"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticate_1 = require("../middlewares/authenticate");
const authenticate_2 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.post('/login', authenticate_1.authenticate, authController_1.login);
router.post('/azure-login', authenticate_1.azureAuthenticate, authController_1.azureAdLogin);
router.post('/register', authController_1.register);
router.post('/logout', authenticate_2.checkJwt, authController_1.logout);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map