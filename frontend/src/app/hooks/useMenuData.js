import { useState, useEffect, useCallback } from 'react';
import { menuService, APIError } from '../services/api';

export function useMenuData() {
  const [data, setData] = useState({
    categories: [],
    subcategories: [],
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompleteMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuService.getCompleteMenu();
      
      if (response.success) {
        setData({
          categories: response.data.categories || [],
          subcategories: response.data.subcategories || [],
          items: response.data.items || []
        });
      }
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchCompleteMenu();
  }, [fetchCompleteMenu]);

  useEffect(() => {
    fetchCompleteMenu();
  }, [fetchCompleteMenu]);

  return {
    data,
    loading,
    error,
    refreshData
  };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuService.getCategories();
      
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
}

export function useSubCategories(categoryId = null) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = categoryId 
        ? await menuService.getSubCategoriesByCategory(categoryId)
        : await menuService.getSubCategories();
      
      if (response.success) {
        setSubcategories(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  return {
    subcategories,
    loading,
    error,
    refetch: fetchSubCategories
  };
}

export function useItems(subCategoryId = null, categoryId = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (subCategoryId) {
        response = await menuService.getItemsBySubCategory(subCategoryId);
      } else if (categoryId) {
        response = await menuService.getItemsByCategory(categoryId);
      } else {
        response = await menuService.getItems();
      }
      
      if (response.success) {
        setItems(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof APIError ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [subCategoryId, categoryId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems
  };
}