import { useAuth } from '@/components/auth-provider';
import { useCart } from '@/components/cart-provider';
import { CustomButton } from '@/components/custom-button';
import { Product } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { act, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function ProductScreen() {
  const { user } = useAuth();
  const { addItem, removeItem, updateQuantity, cartItems } = useCart();
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const [product, setProduct] = useState<Product | null>(null);
  const numId = Number(id);
  const router = useRouter();

  const cartItem = cartItems.find((item) => item.product_id === numId);

  useEffect(() => {
    if (isNaN(numId)) return;
    const fetchProduct = async () => {
      const result = await db.getFirstAsync<Product>(
        `SELECT * FROM products WHERE id = ?`,
        [numId]
      );
      setProduct(result);
    };
    fetchProduct();
  }, []);

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert('Авторизация', 'Войдите в аккаунт для добавления товаров в корзину');
      router.push('/auth');
      return;
    }
    if (!cartItem) {
      addItem(numId, 1);
    } else {
      updateQuantity(numId, cartItem.quantity + 1);
    }
  };

  const handleRemoveFromCart = () => {
    if (cartItem) {
      removeItem(numId);
    }
  };

  const handleUpdateQuantity = (delta: number) => {
    if (cartItem) {
      const newQuantity = cartItem.quantity + delta;
      if (newQuantity <= 0) {
        removeItem(numId);
      } else {
        updateQuantity(numId, newQuantity);
      }
    }
  };

  if (!product || isNaN(numId)) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Товар не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>Цена: {product.price} ₽</Text>

        {cartItem ? (
          <View style={styles.cartControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleUpdateQuantity(-1)}
            >
              <Text style={styles.controlText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{cartItem.quantity}</Text>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleUpdateQuantity(1)}
            >
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CustomButton
            variant="primary"
            title="Добавить в корзину"
            onPress={handleAddToCart}
          />
        )}

        {cartItem && (
          <View style={styles.actions}>
            <CustomButton
              variant="outline"
              title="Перейти в корзину"
              onPress={() => router.push('/cart')}
            />
            <CustomButton
              variant="secondary"
              title="Удалить из корзины"
              onPress={handleRemoveFromCart}
            />
          </View>

        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  info: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 4,
    marginTop: -20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef472c',
    marginBottom: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    backgroundColor: '#efefef',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  controlText: {
    fontSize: 18,
    color: '#333',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 18,
    color: '#888',
  },
});
