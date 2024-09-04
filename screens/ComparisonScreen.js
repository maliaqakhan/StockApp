import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator,StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

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
      return response.data.quoteResponse.result[0] || null;
    } catch (error) {
      console.error('Error fetching stock overview:', error);
      return null;
    }
  };
  
  const ComparisonScreen = () => {
    const [stock1, setStock1] = useState('');
    const [stock2, setStock2] = useState('');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isDarkMode, toggleTheme } = useTheme();
  
    const compareStocks = async () => {
      if (!stock1 || !stock2) {
        setError('Please enter both stock symbols');
        return;
      }
  
      setLoading(true);
      setError('');
      try {
        const [data1, data2] = await Promise.all([
          getStockOverview(stock1),
          getStockOverview(stock2)
        ]);
  
        if (!data1 || !data2) {
          setError('One or both stock symbols are invalid');
          setComparison(null);
        } else {
          setComparison({ stock1: data1, stock2: data2 });
        }
      } catch (error) {
        console.error('Error comparing stocks:', error);
        setError('An error occurred while fetching stock data');
      } finally {
        setLoading(false);
      }
    };
  
    const renderComparisonData = () => {
      if (!comparison) return null;
  
      const { stock1, stock2 } = comparison;
      const fields = [
        { label: 'Price', key: 'regularMarketPrice', format: (value) => `$${value?.toFixed(2) || 'N/A'}` },
        { label: 'Market Cap', key: 'marketCap', format: (value) => value ? `$${(value / 1e9).toFixed(2)}B` : 'N/A' },
        { label: 'P/E Ratio', key: 'trailingPE', format: (value) => value?.toFixed(2) || 'N/A' },
        { label: 'Dividend Yield', key: 'dividendYield', format: (value) => value ? `${(value * 100).toFixed(2)}%` : 'N/A' },
        { label: '52 Week High', key: 'fiftyTwoWeekHigh', format: (value) => `$${value?.toFixed(2) || 'N/A'}` },
        { label: '52 Week Low', key: 'fiftyTwoWeekLow', format: (value) => `$${value?.toFixed(2) || 'N/A'}` },
      ];
  
      return (
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonHeader}>
            <Text style={[styles.comparisonHeaderText, { color: isDarkMode ? '#fff' : '#333' }]}>{stock1.symbol}</Text>
            <Text style={[styles.comparisonHeaderText, { color: isDarkMode ? '#fff' : '#333' }]}>vs</Text>
            <Text style={[styles.comparisonHeaderText, { color: isDarkMode ? '#fff' : '#333' }]}>{stock2.symbol}</Text>
          </View>
          {fields.map((field) => (
            <View key={field.key} style={styles.comparisonRow}>
              <Text style={[styles.comparisonLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>{field.label}</Text>
              <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : '#333' }]}>{field.format(stock1[field.key])}</Text>
              <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : '#333' }]}>{field.format(stock2[field.key])}</Text>
            </View>
          ))}
        </View>
      );
    };
  
    return (
      <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Compare Stocks</Text>
          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333', borderColor: isDarkMode ? '#fff' : '#007AFF' }]}
          placeholder="Enter first stock symbol"
          placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
          value={stock1}
          onChangeText={setStock1}
        />
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#333', borderColor: isDarkMode ? '#fff' : '#007AFF' }]}
          placeholder="Enter second stock symbol"
          placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
          value={stock2}
          onChangeText={setStock2}
        />
        <TouchableOpacity
          style={[styles.compareButton, { backgroundColor: isDarkMode ? '#fff' : '#007AFF' }]}
          onPress={compareStocks}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={isDarkMode ? '#007AFF' : '#fff'} />
          ) : (
            <Text style={[styles.compareButtonText, { color: isDarkMode ? '#007AFF' : '#fff' }]}>Compare</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text> : null}
        {renderComparisonData()}
      </ScrollView>
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
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
  },
  compareButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  compareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  comparisonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  comparisonHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 16,
  },
  comparisonValue: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
});

export default ComparisonScreen;