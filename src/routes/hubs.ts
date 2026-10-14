import { Router } from 'express';
import { HubsController } from '../controllers/hubs';  
import { authenticateKey } from '../middleware/auth.middleware'; // Import the authentication middleware
import { logRequest } from '../middleware/logging.middleware'; // Import the logging middleware
import { validate } from '../middleware/validate.middleware';
import { createHubsZSchema } from '../models/hubs';
import { updateHubsZSchema } from '../models/hubs';

const router = Router();
const hubsController = new HubsController(); 

router.post('/', authenticateKey, logRequest, validate(createHubsZSchema), hubsController.createHub);
router.get('/', hubsController.getHubs);
router.get('/:id', hubsController.getHubById); 
router.put('/:id', authenticateKey, logRequest, validate(updateHubsZSchema), hubsController.updateHub);
router.delete('/:id', hubsController.deleteHub); 

export default router; 