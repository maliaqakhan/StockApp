import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchHistoricalData();
  }, [symbol]);

  const fetchHistoricalData = async () => {
    try {
      const response = await api.get('/stock/v3/get-chart', {
        params: {
          interval: '1d',
          symbol: symbol,
          range: '30d',
          region: 'US'
        }
      });
      
      const prices = response.data.chart.result[0].indicators.quote[0].close;
      const labels = response.data.chart.result[0].timestamp.map(
        timestamp => new Date(timestamp * 1000).toLocaleDateString()
      );

      setChartData({
        labels: labels.slice(-7), // Show only last 7 days on x-axis
        datasets: [{
          data: prices
        }]
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  if (!chartData) {
    return <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>Loading chart data...</Text>;
  }

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: isDarkMode ? '#fff' : '#333' }}>
        30-Day Price Chart
      </Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundColor: isDarkMode ? '#333' : '#ffffff',
          backgroundGradientFrom: isDarkMode ? '#333' : '#ffffff',
          backgroundGradientTo: isDarkMode ? '#333' : '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: isDarkMode ? "#fff" : "#007AFF"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
};

export default StockChart;