import express from 'express';
import { createTransaction, 
          deleteTransaction, 
          getTransactionByUserId, 
          getTransactionSummaryByUserId } from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send("It's working!!!"); // Basic route to test server
}); 

router.get('/:user_id', getTransactionByUserId);     

router.delete('/:id', deleteTransaction);

router.post('/', createTransaction);

router.get('/summary/:user_id', getTransactionSummaryByUserId);

export default router;