import { Product } from "@/types";
import { View, Image, Text,  StyleSheet, Alert, TextInput, TouchableOpacity } from "react-native";
import { useCart } from "./cart-provider";
import { useState } from "react";
import { CustomButton } from "./custom-button";
import { useRouter } from "expo-router";
import { useAuth } from "./auth-provider";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { cartItems, addItem, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const { user } = useAuth();
  const cartItem = cartItems.find(item => item.product_id === product.id);
  const [quantity, setQuantity] = useState<string>(
    cartItem ? String(cartItem.quantity) : '1'
  );

  const isAvalible = product.quantityAvailable > 0;

  const validateAndAddToCart = () => {
    const parsedQuantity = parseInt(quantity, 10);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество товара');
      return;
    }

    if (parsedQuantity > product.quantityAvailable) {
      Alert.alert('Ошибка', `Доступно только ${product.quantityAvailable} шт.`);
      return;
    }

    addItem(product.id, parsedQuantity);
    updateQuantity(product.id, parsedQuantity);
  };

  const onUpdateQuantity = (value: string) => {
    const parsedQuantity = parseInt(value, 10);

    if (!isNaN(parsedQuantity) && parsedQuantity > product.quantityAvailable) {
      Alert.alert('Ошибка', `Доступно только ${product.quantityAvailable} шт.`);
      return;
    }

    setQuantity(value);

    if (cartItem) {
      updateQuantity(product.id, parsedQuantity);
    }
  };

  const deleteFromCart = () => {
    if (!cartItem) return;
    removeItem(cartItem.id);
    setQuantity('1');
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
            <TouchableOpacity style={styles.link} onPress={() => router.push(`/product/${product.id}`)}>
              <View style={styles.link}>
                <Text style={styles.title}>{product.name}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <Text style={styles.price}>{product.price} ₽</Text>
                <Text style={styles.available}>
                  {isAvalible ? `Доступно: ${product.quantityAvailable} шт.` : 'Нет в наличии'} 
                </Text>
              </View>
            </TouchableOpacity>
          <View style={styles.controls}>
          <TextInput
            aria-disabled={!isAvalible}
            style={styles.quantityInput}
            value={quantity}
            readOnly={!isAvalible}
            keyboardType="numeric"
            placeholder="Кол-во"
            placeholderTextColor="#aaa"
            onChangeText={onUpdateQuantity}
          />
          {user && isAvalible ? (
            <CustomButton
              variant="primary"
              title={cartItem ? 'Удалить' : 'В корзину'}
              onPress={cartItem ? deleteFromCart : validateAndAddToCart}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef472c',
  },
  available: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
});
