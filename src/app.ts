import express, {Application, Request, Response} from "express" ;
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "./config/swagger";

import hubsRoutes from './routes/hubs'; 
import bookingsRoutes from './routes/bookings'; 

export const app: Application = express();
app.use(express.json());

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec));
app.use('/api/v1/hubs', hubsRoutes);
app.use('/api/v1/bookings', bookingsRoutes);

//Routes
app.get("/ping", async (_req : Request, res: Response) => {
    res.json({ 
    message: "Welcome to SpaceHub"  
    }); 
}); 
