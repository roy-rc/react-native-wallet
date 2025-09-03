import { sql } from "../config/db.js";

export async function getTransactionByUserId(req, res){
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        } 

        const transactions = await sql`
        SELECT * FROM transaction WHERE user_id = ${user_id} ORDER BY created_at DESC;
        `;
        res.status(200).json(transactions);

    }catch (error) {
        console.error('Error fetching transactions:', error); 
        res.status(500).json({ error: 'Internal server error' });
        return;   
    }
}

export async function createTransaction(req, res){
    try {
        const { title, amount, category, user_id } = req.body;
        
        if (!title || amount === undefined || !category || !user_id) {
            return res.status(400).json({ error: 'All fields are required' });
        } 

        const transaction = await sql`
        INSERT INTO transaction (title, amount, category, user_id) 
        VALUES (${title}, ${amount}, ${category}, ${user_id})
        RETURNING *;
        `;
        console.log('Transaction created:', transaction);
        res.status(201).json(transaction[0]);

    }catch (error) {
        console.error('Error creating transaction:', error); 
        res.status(500).json({ error: 'Internal server error' });
        return;   
    }    
}

export async function deleteTransaction(req, res){
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        } 

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Transaction ID must be a number' });
        }

        const result = await sql`
        DELETE FROM transaction WHERE id = ${id} RETURNING *;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted', transaction: result[0] });

    }catch (error) {
        console.error('Error deleting transaction:', error); 
        res.status(500).json({ error: 'Internal server error' });
        return;   
    }    
}

export async function createCategory(req, res) {
    try {
        const { name, icon, user_id } = req.body;
        
        if (!name || !icon || !user_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const category = await sql`
        INSERT INTO category (name, icon, user_id)
        VALUES (${name}, ${icon}, ${user_id})
        RETURNING *;
        `;
        res.status(201).json(category[0]);

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getCategoriesByUserId(req, res) {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const categories = await sql`
        SELECT * FROM category 
        WHERE user_id = ${user_id}
        ORDER BY name ASC;
        `;
        res.status(200).json(categories);

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        const result = await sql`
        DELETE FROM category WHERE id = ${id} RETURNING *;
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted', category: result[0] });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, icon } = req.body;

        if (!name || !icon) {
            return res.status(400).json({ error: 'Name and icon are required' });
        }

        const result = await sql`
        UPDATE category 
        SET name = ${name}, icon = ${icon}
        WHERE id = ${id}
        RETURNING *;
        `;
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.status(200).json(result[0]);

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getTransactionSummaryByUserId(req, res){
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM transaction
        WHERE user_id = ${user_id};
        `
        const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income   
        FROM transaction
        WHERE user_id = ${user_id} AND amount > 0;
        `
        const expenseResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS expense
        FROM transaction
        WHERE user_id = ${user_id} AND amount < 0;
        `   
        res.status(200).json({
            balance: parseFloat(balanceResult[0].balance),
            income: parseFloat(incomeResult[0].income),
            expense: parseFloat(expenseResult[0].expense)
        });
    }catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}
