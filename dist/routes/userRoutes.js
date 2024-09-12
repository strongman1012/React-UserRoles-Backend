"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/usersList', authenticate_1.checkJwt, userController_1.getAllUsersList);
router.get('/users', authenticate_1.checkJwt, userController_1.getAllUsers);
router.get('/users/:id', authenticate_1.checkJwt, userController_1.getUser);
router.post('/users', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)("Users"), userController_1.createUser);
router.put('/users/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)("Users"), userController_1.updateUser);
router.delete('/users/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)("Users"), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map