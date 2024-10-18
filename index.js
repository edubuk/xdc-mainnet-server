import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import accessRouter from './routes/routes.js';
import dotenv from 'dotenv'

dotenv.config();
const app = express();

// connected to database
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/v1',accessRouter)
app.get('/',(req,res)=>{
  res.send('Hello world !');
})
app.listen(process.env.PORT, () => {
  console.log(`Proxy API listening at http://localhost:${process.env.PORT}`);
});
