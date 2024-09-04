import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeContext';
import StockChart from '../components/StockChart';
import NewsFeed from '../components/NewsFeed';
import { Ionicons } from '@expo/vector-icons';

const StockDetailScreen = ({ route, navigation }) => {
  const { stock } = route.params;
  const { isDarkMode } = useTheme();

  const formatLargeNumber = (num) => {
    if (!num) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const formatPrice = (price) => {
    return price ? `$${price.toFixed(2)}` : 'N/A';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5' }]}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
          </TouchableOpacity>
          <Text style={[styles.symbol, { color: isDarkMode ? '#fff' : '#333' }]}>{stock.symbol}</Text>
          <TouchableOpacity>
            <Ionicons name="star-outline" size={24} color={isDarkMode ? '#fff' : '#333'} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.name, { color: isDarkMode ? '#ccc' : '#666' }]}>{stock.shortName || 'N/A'}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: isDarkMode ? '#fff' : '#333' }]}>
            {formatPrice(stock.regularMarketPrice)}
          </Text>
          <Text style={[styles.change, { color: (stock.regularMarketChangePercent || 0) >= 0 ? '#4CAF50' : '#F44336' }]}>
            {(stock.regularMarketChangePercent || 0) >= 0 ? '▲' : '▼'} 
            {formatPrice(Math.abs(stock.regularMarketChange || 0))} 
            ({Math.abs((stock.regularMarketChangePercent || 0)).toFixed(2)}%)
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <DetailItem label="Open" value={formatPrice(stock.regularMarketOpen)} isDarkMode={isDarkMode} />
          <DetailItem label="High" value={formatPrice(stock.regularMarketDayHigh)} isDarkMode={isDarkMode} />
          <DetailItem label="Low" value={formatPrice(stock.regularMarketDayLow)} isDarkMode={isDarkMode} />
          <DetailItem label="Volume" value={formatLargeNumber(stock.regularMarketVolume)} isDarkMode={isDarkMode} />
          <DetailItem label="Market Cap" value={formatLargeNumber(stock.marketCap)} isDarkMode={isDarkMode} />
          <DetailItem label="52W High" value={formatPrice(stock.fiftyTwoWeekHigh)} isDarkMode={isDarkMode} />
          <DetailItem label="52W Low" value={formatPrice(stock.fiftyTwoWeekLow)} isDarkMode={isDarkMode} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Price Chart</Text>
          <StockChart symbol={stock.symbol} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Recent News</Text>
          <NewsFeed symbol={stock.symbol} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, isDarkMode }) => (
  <View style={styles.detailItem}>
    <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#333' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  priceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailItem: {
    width: '48%',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default StockDetailScreen;