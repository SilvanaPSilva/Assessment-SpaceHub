import {Request, Response} from 'express';
import { HubService } from '../services/hubs';

const hubService = new HubService();

//Reuseble helper
const getHubId = (req: Request): string => {
  return Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
};

export class HubsController { 
//CREATE  
/**
 * @openapi
 * /hubs:
 *   post:
 *     summary: Create a new hub
 *     tags:
 *       - Hubs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHubInput'
 *     responses:
 *       201:
 *         description: Successfully created hub
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
createHub = async (req: Request, res: Response): Promise<void> => {
    try {     
      const newHub = await hubService.createHub(req.body);
      res.status(201).json(newHub);

    } catch (error) {
      res.status(500).json({ message: 'Error inserting into MongoDB', error });
    }
  }; 
//READ ALL HUBS
/**
* @openapi
* /hubs:
*   get:
*     summary: Retrive all Hubs
*     tags:
*       - Hubs
*     responses:
*       200:
*         description: Successfully retrieved hubs
*       500:
*         description: Internal server error
*/
getHubs = async (_req: Request, res: Response): Promise<void> => {
    try {     
      const hubs = await hubService.getAllHubs();
      res.status(200).json(hubs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hub', error });
    }
  };
  //READ ALL BY ID
  /** 
 * @openapi
 * /hubs/{id}:
 *   get:
 *     summary: Get a hub by Id
 *     tags:
 *       - Hubs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string     
 *     responses:
 *       200:
 *         description: Hub found       
 *       404:
 *         description: Hub not found
 *       500:
 *         description: Internal server error
 */
getHubById = async (req: Request, res: Response): Promise<void> => {
    try {
      const hubId = getHubId(req);
      //Reusable helper
      //const hubId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      //Reusable helper [getHubId(req)]so we do not repeat the same code.
      const hubById = await hubService.getHubById(hubId);
      if (!hubById) {
        res.status(404).json({ message: 'Hub not found' });
        return;
      }

      res.status(200).json(hubById);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hub', error });
    }
  };
//UPDATE
  /** 
 * @openapi
 * /hubs/{id}:
 *   put:
 *     summary: Update an existing hub
 *     tags:
 *       - Hubs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHubInput'
 *     responses:
 *       200:
 *         description: Successfully updated hub
 *       400:
 *         description: Bad request
 *       404:
 *         description: Hub not found
 *       500:
 *         description: Internal server error
 */
updateHub = async (req: Request, res: Response): Promise<void> => {
    try {
      const hubId = getHubId(req); //Reusable helper - Line 91
      const updatedHub = await hubService.updateHub(hubId, req.body);
      if (!updatedHub) {
        res.status(404).json({ message: 'Hub not found' });
        return;
      }
      res.status(200).json(updatedHub);
    } catch (error) {
      res.status(500).json({ message: 'Error updating hub', error });
    }
  };
//DELETE
/**
* @openapi
* /hubs/{id}:
*   delete:
*     summary: Delete a hub by ID
*     tags:
*       - Hubs
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Hub deleted successfully
*       404:
*         description: Hub not found
*       500:
*         description: Internal server error
*/
  deleteHub = async (req: Request, res: Response): Promise<void> => {
    try {
      const hubId = getHubId(req); //Reusable helper - Line 91
      const deletedHub = await hubService.deleteHub(hubId);
      if (!deletedHub) {
        res.status(404).json({ message: 'Hub not found' });
        return;
      }
      res.status(200).json({
        message: 'Hub deleted successfully',
        data: deletedHub
      });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting hub', error });
    }
  };
} 