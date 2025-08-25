//react custom hook to fetch transactions
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { API_URL } from '../constants/api.js';

//esta url funciona para emulador android local
//const API_URL = "http://localhost:5001/api";

//esto sirve para ejecutar en emulador expo en el telefono fisico
//const API_URL = "https://react-native-wallet-backend-g81m.onrender.com/api";


export const useTransactions = (userId) => { 
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ 
        balance: 0, 
        income: 0, 
        expense: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    //useCallback is used for performance optimization it will memoize the function
    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transaction/${userId}`);
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }, [userId]);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/transaction/summary/${userId}`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        //can be run in parallel
        try {
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, fetchSummary, userId])

    const deleteTransaction = async (id) => {
        try {
            const response = await fetch(`${API_URL}/transaction/${id}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("Failed to delete transaction");
            }   
            //Refresh the transactions list
            loadData();
            Alert.alert("Success", "Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error", error.message);
        }
    }

    return { transactions, summary, isLoading, loadData, deleteTransaction };
};