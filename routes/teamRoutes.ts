import { Router } from 'express';
import { getAllTeamsList, getAllTeams, getTeam, createTeam, updateTeam, deleteTeam } from '../controllers/teamController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/teamsList', checkJwt, getAllTeamsList);
router.get('/teams', checkJwt, getAllTeams);
router.get('/teams/:id', checkJwt, getTeam);
router.post('/teams', checkJwt, checkPermission('Teams'), createTeam);
router.put('/teams/:id', checkJwt, checkPermission('Teams'), updateTeam);
router.delete('/teams/:id', checkJwt, checkPermission('Teams'), deleteTeam);

export default router;
