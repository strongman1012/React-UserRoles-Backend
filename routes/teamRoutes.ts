import { Router } from 'express';
import { getAllTeams, getTeam, createTeam, updateTeam, deleteTeams } from '../controllers/teamController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/teams', checkJwt, getAllTeams);
router.get('/teams/:id', checkJwt, getTeam);
router.post('/teams', checkJwt, checkPermission('Teams'), createTeam);
router.put('/teams/:id', checkJwt, checkPermission('Teams'), updateTeam);
router.delete('/teams', checkJwt, checkPermission('Teams'), deleteTeams);

export default router;
