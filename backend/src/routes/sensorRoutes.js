import express from 'express';
import { submitSensorData, getLatestSensorData, getSensorHistory } from '../controllers/sensorController.js';
import { validateSensorData, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/sensor-data', validateSensorData, handleValidationErrors, submitSensorData);
router.get('/sensor-data/latest', getLatestSensorData);
router.get('/sensor-data/history', getSensorHistory);

export default router;
