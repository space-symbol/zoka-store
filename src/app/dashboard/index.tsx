import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { Link } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

export const SidebarLink = ({ children, route }: { children: React.ReactNode, route: string }) => {
  const { toggleSidebar } = useSidebarContext();
  return (
    <TouchableOpacity onPress={() => toggleSidebar()}>
      <Link style={styles.sidebarLink} href={route}>{children}</Link>
    </TouchableOpacity>
  );
} 


const sidebarRoutes = [
  { name: 'Главная', route: 'dashboard' },
  { name: 'Пользователи', route: '/users' },
  { name: 'Заказы', route: 'dashboard/orders' },
  { name: 'Товары', route: 'products' },
]

interface SidebarContextProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sidebarPosition: Animated.Value
}

const SidbarContext = React.createContext({} as SidebarContextProps);

export const SidbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarPosition = useState(new Animated.Value(-250))[0];

  const toggleSidebar = () => {
    Animated.timing(sidebarPosition, {
      toValue: isOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  return (
    <SidbarContext.Provider value={{
      isOpen,
      toggleSidebar,
      sidebarPosition
    }}>
      {children}
    </SidbarContext.Provider>
  );
}

export const useSidebarContext = () => React.useContext(SidbarContext);


export const Sidebar = () => {
  const { toggleSidebar, sidebarPosition } = useSidebarContext();

  return (
    <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarPosition }] }]}
      >
        <TouchableOpacity onPress={toggleSidebar} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logo}>Admin Panel</Text>
        <View style={styles.navItems}>
          {sidebarRoutes.map((route) => (
            <SidebarLink route={route.route} key={route.name}>
              {route.name}
            </SidebarLink>
          ))}
        </View>
      </Animated.View>
  )
}

type StatTitle = 'Пользователи' | 'Активные заказы' | 'Общий доход' | 'Товары в каталоге';
const AdminDashboard = () => {
  const db = useSQLiteContext();
  const { isOpen: isSidebarOpen, toggleSidebar, sidebarPosition } = useSidebarContext();
  const [stats, setStats] = useState<{ title: StatTitle; value: number | string }[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([0]);

  

  useEffect(() => {
    const fetchStats = async () => {
  
      try {
        const usersQuery = 'SELECT COUNT(*) as total FROM users';
        const activeOrdersQuery = 'SELECT COUNT(*) as total FROM `orders` WHERE status not in ("completed", "cancelled")';
        const revenueQuery = 'SELECT SUM(total_price) as revenue FROM `orders`';
        const productsQuery = 'SELECT COUNT(*) as total FROM products';
  
        const usersResult = await db.getFirstAsync<{ total: number }>(usersQuery);
        const activeOrdersResult = await db.getFirstAsync<{ total: number }>(activeOrdersQuery);
        const revenueResult = await db.getFirstAsync<{ revenue: number }>(revenueQuery);
        const productsResult = await db.getFirstAsync<{ total: number }>(productsQuery);

        setStats([
          { title: 'Пользователи', value:  Number(usersResult?.total) || 0 },
          { title: 'Активные заказы', value:  Number(activeOrdersResult?.total) || 0 },
          { title: 'Общий доход', value: Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(revenueResult?.revenue) || 0) },
          { title: 'Товары в каталоге', value:  Number(productsResult?.total) || 0 },
        ]);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      }
    };
  
    const fetchRevenueData = async () => {
      try {
        const revenueDataQuery = "SELECT strftime('%Y-%m', created_at) as month, SUM(total_price) as revenue FROM `orders` GROUP BY month ORDER BY month DESC LIMIT 6";
        const result = await db.getAllAsync<{ month: string; revenue: number }>(revenueDataQuery);
        const sanitizedRevenueData = result.map((value) => {
          const numValue = Number(value.revenue);
          isFinite(numValue) && !isNaN(numValue) ? value : 0
          return numValue;
        });
        setRevenueData(sanitizedRevenueData);
      } catch (error) {
        console.error('Ошибка при получении данных доходов:', error);
      }
    };
  
    fetchStats();
    fetchRevenueData();
  }, [db]);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navToggle} onPress={toggleSidebar}>
        <Ionicons name="menu" size={32} color="#333" />
      </TouchableOpacity>

      {isSidebarOpen && (
        <TouchableOpacity onPress={toggleSidebar} style={styles.overlay} />
      )}

      <View style={styles.main}>
        <ScrollView>
          <Text style={styles.header}>Дэшборд</Text>

          <View style={styles.stats}>
            {stats.map((stat) => (
              <View key={stat.title} style={styles.statCard}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeader}>Доход за последние 6 месяцев</Text>
          <LineChart
            data={{
              labels: ['Месяц 1', 'Месяц 2', 'Месяц 3', 'Месяц 4', 'Месяц 5', 'Месяц 6'],
              datasets: [
                {
                  data: revenueData,
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            yAxisLabel="₽"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default AdminDashboard;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#2c3e50',
    padding: 16,
    zIndex: 10,
    overflow: 'hidden',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 16,
  },
  navItems: {
    marginTop: 16,
  },
  sidebarLink: {
    fontSize: 16,
    color: '#ecf0f1',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  navToggle: {
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 10,
  },
  main: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  table: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  rowHeader: {
    backgroundColor: '#ecf0f1',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  chartPlaceholder: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

