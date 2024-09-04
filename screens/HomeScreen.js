import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import StockChart from '../components/StockChart';
import NewsFeed from '../components/NewsFeed';
import { useTheme } from '../ThemeContext';

const API_KEY = 'cccafdf3edmshc93b1e982082d52p13979fjsn8e3030c0de74';
const BASE_URL = 'https://yh-finance.p.rapidapi.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'yh-finance.p.rapidapi.com'
  }
});

const getStockOverview = async (symbol) => {
  try {
    const response = await api.get('/market/v2/get-quotes', { params: { symbols: symbol } });
    return response.data.quoteResponse.result || [];
  } catch (error) {
    console.error('Error fetching stock overview:', error);
    return [];
  }
};

const searchStockByName = async (query) => {
  try {
    const response = await api.get('/auto-complete', { params: { q: query } });
    return response.data.quotes || [];
  } catch (error) {
    console.error('Error searching stock by name:', error);
    return [];
  }
};

const HomeScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const fetchStockData = async () => {
    if (query.trim() === '') {
      setError('Please enter a stock name or symbol.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      let stockData;

      if (/^[A-Z]+$/.test(query)) {
        stockData = await getStockOverview(query);
      } else {
        const results = await searchStockByName(query);
        if (results.length > 0) {
          const symbol = results[0].symbol;
          stockData = await getStockOverview(symbol);
        } else {
          stockData = [];
        }
      }

      if (stockData.length > 0) {
        setStocks(stockData);
      } else {
        setStocks([]);
        setError('No results found');
      }
    } catch (error) {
      setError('An error occurred while fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

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

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const addToWatchlist = async (stock) => {
    try {
      if (!watchlist.some(item => item.symbol === stock.symbol)) {
        const updatedWatchlist = [...watchlist, { symbol: stock.symbol, name: stock.shortName }];
        setWatchlist(updatedWatchlist);
        await AsyncStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
        alert(`${stock.symbol} added to watchlist`);
      } else {
        alert(`${stock.symbol} is already in your watchlist`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const renderStockItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.stockContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
      onPress={() => navigation.navigate('StockDetail', { stock: item })}
    >
      <View style={styles.stockContent}>
        <View style={styles.stockHeader}>
          <Text style={[styles.symbol, { color: isDarkMode ? '#fff' : '#333' }]}>{item.symbol}</Text>
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={() => addToWatchlist(item)}
          >
            <Ionicons name="star-outline" size={24} color={isDarkMode ? '#fff' : '#007AFF'} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: isDarkMode ? '#ccc' : '#666' }]}>{item.shortName}</Text>
        <View style={styles.stockDetails}>
          <Text style={[styles.price, { color: isDarkMode ? '#fff' : '#333' }]}>${item.regularMarketPrice.toFixed(2)}</Text>
          <Text style={[styles.change, { color: item.regularMarketChangePercent >= 0 ? '#4CAF50' : '#F44336' }]}>
            {item.regularMarketChangePercent >= 0 ? '▲' : '▼'} {Math.abs(item.regularMarketChangePercent).toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Stock Overview</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333', borderColor: isDarkMode ? '#fff' : '#007AFF' }]}
          placeholder="Enter stock name or symbol"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: isDarkMode ? '#fff' : '#007AFF' }]} onPress={fetchStockData} disabled={loading}>
          <Ionicons name="search" size={24} color={isDarkMode ? '#007AFF' : '#fff'} />
        </TouchableOpacity>
      </View>
      {error ? <Text style={[styles.error, { color: isDarkMode ? '#FF6B6B' : '#F44336' }]}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#007AFF'} />
          <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#666' }]}>Loading stock data...</Text>
        </View>
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={(item) => item.symbol}
          renderItem={renderStockItem}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: isDarkMode ? '#ccc' : '#666' }]}>No stocks to display. Try searching for a stock.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop:40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
 
  stockContainer: {
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockContent: {
    padding: 15,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    marginBottom: 10,
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  watchlistButton: {
    padding: 5,
  },

  error: {
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default HomeScreen;