import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import axios from 'axios';
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

const NewsFeed = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  const fetchNews = async () => {
    try {
      const response = await api.get('/news/v2/get-details', {
        params: { symbol: symbol }
      });
      setNews(response.data.data.stream_items.slice(0, 3));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsItem} 
      onPress={() => Linking.openURL(item.article_url)}
    >
      <Text style={[styles.newsTitle, { color: isDarkMode ? '#fff' : '#007AFF' }]}>{item.title}</Text>
      <Text style={[styles.newsPublisher, { color: isDarkMode ? '#ccc' : '#666' }]}>{item.publisher}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#333' }]}>Recent News</Text>
      <FlatList
        data={news}
        keyExtractor={(item) => item.uuid}
        renderItem={renderNewsItem}
        ListEmptyComponent={<Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>No recent news available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newsItem: {
    marginBottom: 10,
  },
  newsTitle: {
    fontSize: 16,
  },
  newsPublisher: {
    fontSize: 14,
  },
});

export default NewsFeed;