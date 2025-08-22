import AsyncStorage from '@react-native-async-storage/async-storage';

// פונקציות עזר לדיבוג
export const debugUtils = {
  // ניקוי כל הנתונים השמורים
  async clearAllStorage() {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      return false;
    }
  },

  // הצגת כל הנתונים השמורים
  async showAllStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      console.log('AsyncStorage contents:');
      items.forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
      
      return items;
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
      return [];
    }
  },

  // ניקוי נתוני אימות בלבד
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'store_slug']);
      console.log('Auth data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return false;
    }
  },
};
