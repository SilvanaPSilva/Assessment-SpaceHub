import express, {Application, Request, Response} from "express" ;
import hubsRoutes from './routes/hubs'; 
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from "./config/swagger";

export const app: Application = express();

app.use(express.json())
app.use('/api/v1/hubs', hubsRoutes);
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec));

//Routes
app.get("/ping", async (_req : Request, res: Response) => {
    res.json({ 
    message: "Welcome to SpaceHub"  
    }); 
}); 
