import { body, validationResult } from 'express-validator';

export const validateSensorData = [
  body('soilMoisture').isFloat({ min: 0, max: 100 }).withMessage('Soil moisture must be between 0-100'),
  body('waterLevel').optional().isFloat({ min: 0 }),
  body('tilt').optional().isFloat({ min: 0 }),
  body('vibration').optional().isFloat({ min: 0 }),
  body('ultrasonicDistance').optional().isFloat({ min: 0 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
