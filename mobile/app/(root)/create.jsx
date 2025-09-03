import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { API_URL } from '../../constants/api';
import { styles } from '../../assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const CreateScreen = () => {
  const router = useRouter(); 
  const {user} = useUser();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isExpense, setIsExpense] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/transaction/category/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const handleCreate = async () => {
    console.log("title", title);
    console.log("amount", amount);
    console.log("selectedCategory", selectedCategory.id);
    console.log("user_id", user.id);
    if(!title) return Alert.alert("Please enter a title");

    if(!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <=0 ) {
      Alert.alert("Please enter a valid amount");
      return;
    }

    if(!selectedCategory) return Alert.alert("Please select a category");

    setIsLoading(true);
    try {
        //format the amount (negative for expense and positive for income)
        const formattedAmount = isExpense ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));
        const response = await fetch(`${API_URL}/transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                title: title,
                amount: formattedAmount,
                category: selectedCategory.id,
                date: new Date(),
            }),
        }); 
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create transaction");
        }
        Alert.alert("Success", "Transaction created successfully");
        router.back();
    } catch (error) {
      console.error("Error creating transaction:", error);
      Alert.alert("Error", error.message || "Failed to create transaction");
      
    } finally {
      setIsLoading(false);
    }

    
  }
  
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <TouchableOpacity
          style={[ styles.saveButtonContainer, isLoading ? styles.saveButtonDisabled : null]}
          onPress={handleCreate}
          disabled={isLoading}>
          <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
          { !isLoading && <Ionicons name="checkmark" size={18} color={COLORS.primary} /> }
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.typeSelector}>
          {/* EXPENSE SELECTOR */}
          <TouchableOpacity
            style={[ styles.typeButton, isExpense && styles.typeButtonActive ]}
            onPress={() => setIsExpense(true)}>
            <Ionicons 
              name="arrow-down-circle"
              size={22}
              color={ isExpense ? COLORS.white : COLORS.expense }
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          {/* INCOME SELECTOR */}
          <TouchableOpacity
            style={[ styles.typeButton, !isExpense && styles.typeButtonActive ]}
            onPress={() => setIsExpense(false)}>
            <Ionicons 
              name="arrow-up-circle"
              size={22}
              color={ !isExpense ? COLORS.white : COLORS.income }
              style={styles.typeIcon}
            />
            <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>
        {/* AMOUNT CONTAINER */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput 
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={COLORS.textLight}
            value={amount}
            onChangeText={(text) => setAmount(text)}
            keyboardType="numeric"
          />
        </View>
        {/* INPUT CONTAINER*/}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="create-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput 
            style={styles.input}
            placeholder="Transaction Title"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        {/* CATEGORY */}
        <Text style={styles.sectionTitle}>
          <Ionicons 
            name="pricetags-outline"
            size={16}
            color={COLORS.text}
          /> Category
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory?.id === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons 
                name={category.icon}
                size={20}
                color={selectedCategory?.id === category.id ? COLORS.white : COLORS.text}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory?.id === category.id && styles.categoryButtonTextActive
              ]}>{" "}{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  )
}

export default CreateScreen