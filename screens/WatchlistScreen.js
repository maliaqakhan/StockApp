import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

const WatchlistScreen = ({ navigation }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const loadWatchlist = async () => {
    try {
      const savedWatchlist = await AsyncStorage.getItem('watchlist');
      if (savedWatchlist !== null) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  }, []);

  const removeFromWatchlist = async (symbol) => {
    try {
      const updatedWatchlist = watchlist.filter(item => item.symbol !== symbol);
      setWatchlist(updatedWatchlist);
      await AsyncStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const renderWatchlistItem = ({ item }) => (
    <View style={[styles.watchlistItem, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
      <Text style={[styles.symbol, { color: isDarkMode ? '#fff' : '#333' }]}>{item.symbol}</Text>
      <Text style={[styles.name, { color: isDarkMode ? '#ccc' : '#666' }]}>{item.name}</Text>
      <TouchableOpacity onPress={() => removeFromWatchlist(item.symbol)}>
        <Ionicons name="close-circle" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Watchlist</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.symbol}
        renderItem={renderWatchlistItem}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: isDarkMode ? '#ccc' : '#666' }]}>Your watchlist is empty.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#fff' : '#007AFF']}
            tintColor={isDarkMode ? '#fff' : '#007AFF'}
          />
        }
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  
  header: {
    marginTop:30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  watchlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default WatchlistScreen;