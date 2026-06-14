import express from 'express';
import { getPredictions, getLatestPrediction } from '../controllers/mlController.js';

const router = express.Router();

router.get('/ml/predictions', getPredictions);
router.get('/ml/predictions/latest', getLatestPrediction);

export default router;
