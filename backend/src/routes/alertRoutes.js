import express from 'express';
import { getAlerts, createAlert, resolveAlert } from '../controllers/alertController.js';

const router = express.Router();

router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.patch('/alerts/:id/resolve', resolveAlert);

export default router;
