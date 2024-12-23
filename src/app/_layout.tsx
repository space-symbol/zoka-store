import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '@/db/migrate';
import { Navbar, NavbarProvider, NavbarSwitcher } from '@/components/navbar';
import { StyleSheet, View } from 'react-native';
import CartIconWidget, { CartProvider } from '@/components/cart-provider';
import { AuthProvider } from '@/components/auth-provider';

export type Role  = 'admin' | 'user';

export default function RootLayout() {

  return (
    <SQLiteProvider databaseName="store.db" onInit={migrateDbIfNeeded}>
        <AuthProvider>
          <NavbarProvider>
            <CartProvider>
              <Navbar />
              <View style={styles.container}>
                <View style={styles.switcher}>
                    <CartIconWidget />
                    <NavbarSwitcher />
                </View>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
                  <Stack.Screen name="(shop)/index" options={{ title: 'Главная' }}/>
                  <Stack.Screen name="(shop)/catalog" options={{ title: 'Каталог' }}/>
                  <Stack.Screen name="auth" options={{ headerShown: false }}/>
                  <Stack.Screen name="dashboard" options={{headerShown: false}}/>
                  <Stack.Screen name="(tabs)/orders" options={{ title: 'Заказы' }}/>
                  <Stack.Screen name="(shop)/category/[id]" getId={({ params }) => String(Date.now())} options={{ title: '' }}/>
                  <Stack.Screen name="(shop)/product/[id]" getId={({ params }) => String(Date.now())} options={{title: ''}}/>
                  <Stack.Screen name="+not-found" options={{headerShown: false}}/>
                </Stack>
              </View>
          </CartProvider>
          </NavbarProvider>
        </AuthProvider>
      </SQLiteProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%'
  },
  switcher: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 105
  }
})