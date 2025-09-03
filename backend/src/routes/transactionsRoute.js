import express from 'express';
import { createTransaction, 
          deleteTransaction, 
          getTransactionByUserId, 
          getTransactionSummaryByUserId,
          createCategory,
          getCategoriesByUserId,
          deleteCategory,
          updateCategory } from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/status', (req, res) => {
  res.send("It's working!!!"); // Basic route to test server
}); 

router.get('/:user_id', getTransactionByUserId);     

router.delete('/:id', deleteTransaction);

router.post('/', createTransaction);

router.get('/summary/:user_id', getTransactionSummaryByUserId);

// Category routes
router.post('/category', createCategory);
router.get('/category/:user_id', getCategoriesByUserId);
router.delete('/category/:id', deleteCategory);
router.put('/category/:id', updateCategory);

export default router;