"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/users', authenticate_1.checkJwt, userController_1.getAllUsers); // Get all users
router.get('/users/:id', authenticate_1.checkJwt, userController_1.getUser); // Get a user by ID
router.put('/users/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)("Users"), userController_1.updateUser); // Update a user by ID
router.delete('/users/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)("Users"), userController_1.deleteUser); // Delete a user by ID
exports.default = router;
//# sourceMappingURL=userRoutes.js.map