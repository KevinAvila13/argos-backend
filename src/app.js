import express from 'express';
import cors from 'cors';
import caseRoutes from './routes/case.routes.js';
import evidenceRoutes from './routes/evidence.routes.js';   

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);

export default app;
