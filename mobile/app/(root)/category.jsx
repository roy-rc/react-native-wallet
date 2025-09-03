import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { COLORS } from '../../constants/colors';
import { API_URL } from '../../constants/api';

const AVAILABLE_ICONS = [
  { id: 'fast-food', name: 'Fast Food' },
  { id: 'cart', name: 'Shopping Cart' },
  { id: 'car', name: 'Car' },
  { id: 'film', name: 'Entertainment' },
  { id: 'receipt', name: 'Receipt' },
  { id: 'cash', name: 'Money' },
  { id: 'ellipsis-horizontal', name: 'Other' }
];

const CategoryScreen = () => {
  const { user } = useUser();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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

  const handleSubmit = async () => {
    if (!name || !selectedIcon) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingCategory 
        ? `${API_URL}/transaction/category/${editingCategory.id}`
        : `${API_URL}/transaction/category`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          icon: selectedIcon,
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      Alert.alert('Success', `Category ${editingCategory ? 'updated' : 'created'} successfully`);
      setName('');
      setSelectedIcon('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/transaction/category/${id}`, {
                method: 'DELETE',
              });
              if (!response.ok) throw new Error('Failed to delete category');
              fetchCategories();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(category.icon);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Category Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <TouchableOpacity
          style={styles.iconSelector}
          onPress={() => setShowIconPicker(!showIconPicker)}
        >
          {selectedIcon ? (
            <Ionicons name={selectedIcon} size={24} color={COLORS.text} />
          ) : (
            <Text style={styles.iconPlaceholder}>Select an Icon</Text>
          )}
          <Ionicons name="chevron-down" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {showIconPicker && (
          <View style={styles.iconList}>
            {AVAILABLE_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon.id}
                style={styles.iconItem}
                onPress={() => {
                  setSelectedIcon(icon.id);
                  setShowIconPicker(false);
                }}
              >
                <Ionicons name={icon.id} size={24} color={COLORS.text} />
                <Text style={styles.iconName}>{icon.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {editingCategory ? 'Update Category' : 'Add Category'}
          </Text>
          {isLoading && <ActivityIndicator color={COLORS.white} />}
        </TouchableOpacity>
      </View>

      {/* CATEGORY LIST */}
      <ScrollView style={styles.list}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Ionicons name={category.icon} size={24} color={COLORS.text} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(category)}
              >
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(category.id)}
              >
                <Ionicons name="trash" size={20} color={COLORS.expense} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    color: COLORS.text,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  iconPlaceholder: {
    color: COLORS.textLight,
  },
  iconList: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  iconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconName: {
    marginLeft: 12,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginRight: 8,
  },
  list: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    marginBottom: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    marginLeft: 12,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
};

export default CategoryScreen;