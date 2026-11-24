import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import minesRouter from './routes/mines.js';
import methodologyRouter from './routes/methodology.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'CoalZero API' });
});

app.use('/api/mines', minesRouter);
app.use('/api/methodology', methodologyRouter);

app.listen(PORT, () => {
  console.log(`CoalZero API running on http://localhost:${PORT}`);
});