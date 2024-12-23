import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { CustomButton } from '@/components/custom-button';
import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/components/cart-provider';

export default function CartScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { removeItem, updateQuantity, cartItems: cart, clear } = useCart();
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(false);

  if (!user) return <Redirect href="auth" />;

  const updateCartItemQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert('Ошибка', 'Количество должно быть больше нуля.');
      return;
    }

    try {
      updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      console.error('Ошибка при обновлении количества товара:', error);
      Alert.alert('Ошибка', 'Не удалось обновить товар.');
    }
  };

  const removeCartItem = async (productId: number) => {
    try {
      removeItem(productId);
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      Alert.alert('Ошибка', 'Не удалось удалить товар из корзины.');
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const result = await db.getAllAsync<{ id: number; quantityAvailable: number }>(
        `SELECT id, quantityAvailable FROM products WHERE id IN (${cart
          .map((item) => item.product_id)
          .join(',')})`
      );

      const outOfStockItems = cart.filter((item) =>
        result.some(
          (product) => product.id === item.product_id && product.quantityAvailable < item.quantity
        )
      );

      if (outOfStockItems.length > 0) {
        cart.map((item) => {
          removeItem(item.id);
        })
        Alert.alert(
          'Ошибка',
          'Некоторые товары недоступны в указанном количестве. Пожалуйста, обновите корзину.'
        );
        setLoading(false);
        return;
      }
      
      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const orderId = await db.getFirstAsync<number>(
        'INSERT INTO orders (user_id, total_price) VALUES (?, ?) RETURNING id;',
        [user.id, totalPrice]
      );
      
      const insertOrderItems = orderItems.map(async(item) => {
        await db.runAsync(`INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?);`, [orderId, item.product_id, item.quantity]);
      })
      Promise.all(insertOrderItems);
      clear();
      Alert.alert('Успех', 'Заказ успешно создан!');
      router.push('/orders');
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      Alert.alert('Ошибка', 'Не удалось создать заказ.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <ScrollView style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ваша корзина пуста</Text>
          <CustomButton
            variant="primary"
            title="Перейти к покупкам"
            onPress={() => router.push('/catalog')}
          />
        </View>
      ) : (
        <View>
          {cart.map((item) => (
            <View key={item.product_id} style={styles.cartItem}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price} ₽</Text>
                <Text style={styles.quantityAvailable}>В наличии: {item.quantityAvailable}</Text>
                <View style={styles.controls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateCartItemQuantity(item.product_id, item.quantity - 1)}
                  >
                    <Text style={styles.controlText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => updateCartItemQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Text style={styles.controlText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCartItem(item.product_id)}
                  >
                    <Text style={styles.removeButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.summary}>
            <Text style={styles.totalText}>
              Итого:{' '}
              {Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              }).format(totalPrice)}
            </Text>
            <CustomButton
              variant="primary"
              title={loading ? 'Создание заказа...' : 'Создать заказ'}
              onPress={createOrder}
              disabled={loading}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#ef472c',
    marginBottom: 4,
  },
  quantityAvailable: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  controlText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#ff4d4f',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  summary: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 16,
  },
});
