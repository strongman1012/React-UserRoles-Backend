"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const authenticate_1 = require("../middlewares/authenticate");
const checkPermission_1 = require("../middlewares/checkPermission");
const router = (0, express_1.Router)();
router.get('/teamsList', authenticate_1.checkJwt, teamController_1.getAllTeamsList);
router.get('/teams', authenticate_1.checkJwt, teamController_1.getAllTeams);
router.get('/teams/:id', authenticate_1.checkJwt, teamController_1.getTeam);
router.post('/teams', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Teams'), teamController_1.createTeam);
router.put('/teams/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Teams'), teamController_1.updateTeam);
router.delete('/teams/:id', authenticate_1.checkJwt, (0, checkPermission_1.checkPermission)('Teams'), teamController_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=teamRoutes.js.map