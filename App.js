import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { TrendingUp, TrendingDown, Wallet, LayoutDashboard } from 'lucide-react-native';
import Constants from 'expo-constants';

const STOCKS = [
  { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', price: 2540.50, change: 1.2 },
  { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: 3420.80, change: -0.5 },
  { id: '3', symbol: 'INFY', name: 'Infosys Limited', price: 1510.20, change: 0.8 },
  { id: '4', symbol: 'HDFC', name: 'HDFC Bank', price: 1650.00, change: -1.1 },
  { id: '5', symbol: 'ICICI', name: 'ICICI Bank', price: 920.45, change: 2.3 },
  { id: '6', symbol: 'WIPRO', name: 'Wipro Limited', price: 410.15, change: -0.2 },
];

export default function App() {
  const [balance, setBalance] = useState(100000); // 1 Lakh initial virtual cash
  const [portfolio, setPortfolio] = useState({});
  const [view, setView] = useState('market'); // 'market', 'portfolio'

  const buyStock = (stock) => {
    if (balance < stock.price) {
      Alert.alert('Inadequate Funds', 'You do not have enough virtual cash.');
      return;
    }
    setBalance(prev => prev - stock.price);
    setPortfolio(prev => {
      const currentQty = prev[stock.symbol]?.qty || 0;
      return {
        ...prev,
        [stock.symbol]: {
          ...stock,
          qty: currentQty + 1,
          avgPrice: ((prev[stock.symbol]?.avgPrice || 0) * currentQty + stock.price) / (currentQty + 1)
        }
      };
    });
    Alert.alert('Success', `Bought 1 share of ${stock.symbol}`);
  };

  const sellStock = (stock) => {
    if (!portfolio[stock.symbol] || portfolio[stock.symbol].qty <= 0) {
      Alert.alert('Error', 'You do not own this stock.');
      return;
    }
    setBalance(prev => prev + stock.price);
    setPortfolio(prev => {
      const currentQty = prev[stock.symbol].qty;
      if (currentQty === 1) {
        const newPortfolio = { ...prev };
        delete newPortfolio[stock.symbol];
        return newPortfolio;
      }
      return {
        ...prev,
        [stock.symbol]: {
          ...prev[stock.symbol],
          qty: currentQty - 1
        }
      };
    });
    Alert.alert('Success', `Sold 1 share of ${stock.symbol}`);
  };

  const renderStockItem = ({ item }) => (
    <View style={styles.stockItem}>
      <View>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.stockPrice}>₹{item.price.toFixed(2)}</Text>
        <View style={styles.changeBadge(item.change > 0)}>
          <Text style={styles.changeText}>{item.change > 0 ? '+' : ''}{item.change}%</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.buyButton} onPress={() => buyStock(item)}>
            <Text style={styles.buttonText}>BUY</Text>
          </TouchableOpacity>
          {portfolio[item.symbol] && (
            <TouchableOpacity style={styles.sellButton} onPress={() => sellStock(item)}>
              <Text style={styles.buttonText}>SELL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const portfolioData = Object.values(portfolio);
  const totalValue = balance + portfolioData.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Paper Trading</Text>
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Total Value</Text>
            <Text style={styles.balanceValue}>₹{totalValue.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.balanceLabel}>Cash Available</Text>
            <Text style={[styles.balanceValue, { fontSize: 18 }]}>₹{balance.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.navTab}>
        <TouchableOpacity 
          style={[styles.tab, view === 'market' && styles.activeTab]} 
          onPress={() => setView('market')}
        >
          <LayoutDashboard color={view === 'market' ? '#007AFF' : '#666'} size={20} />
          <Text style={[styles.tabText, view === 'market' && styles.activeTabText]}>Market</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, view === 'portfolio' && styles.activeTab]} 
          onPress={() => setView('portfolio')}
        >
          <Wallet color={view === 'portfolio' ? '#007AFF' : '#666'} size={20} />
          <Text style={[styles.tabText, view === 'portfolio' && styles.activeTabText]}>Portfolio</Text>
        </TouchableOpacity>
      </View>

      {view === 'market' ? (
        <FlatList
          data={STOCKS}
          renderItem={renderStockItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={portfolioData}
          renderItem={({ item }) => (
            <View style={styles.stockItem}>
              <View>
                <Text style={styles.stockSymbol}>{item.symbol}</Text>
                <Text style={styles.stockName}>{item.qty} Shares</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.stockPrice}>₹{(item.qty * item.price).toFixed(2)}</Text>
                <Text style={styles.stockName}>Avg: ₹{item.avgPrice.toFixed(2)}</Text>
                <TouchableOpacity style={styles.sellButton} onPress={() => sellStock(item)}>
                  <Text style={styles.buttonText}>SELL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No stocks in portfolio</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  navTab: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#E5F1FF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
  },
  listContent: {
    padding: 15,
  },
  stockItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stockName: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  changeBadge: (isPositive) => ({
    backgroundColor: isPositive ? '#34C759' : '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
  }),
  changeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  buyButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  sellButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8E8E93',
    fontSize: 16,
  }
});
