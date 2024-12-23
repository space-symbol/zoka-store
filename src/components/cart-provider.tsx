import { getCartItems, ICartItem, updateCartItemQuantity, removeFromCart, clearCart, addToCart } from "@/utils/cart-utils";
import { useRouter } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { createContext, useContext, useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from "./auth-provider";

interface CartItemProps {
    item: ICartItem;
    onUpdateQuantity: (product_id: number, quantity: number) => void;
    onRemove: (product_id: number) => void;
}

interface CartContextType {
    cartItems: ICartItem[];
    totalQuantity: number;
    addItem: (product_id: number, quantity: number) => void;
    updateQuantity: (product_id: number, quantity: number) => void;
    removeItem: (product_id: number) => void;
    clear: () => void;
}

const CartContext = createContext({} as CartContextType);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const db = useSQLiteContext();
  const { user } = useAuth();

  const fetchCartItems = async () => {
    const items = await getCartItems(db, user?.id);
    setCartItems(items);

    const total = items.reduce((acc, item) => acc + item.quantity, 0);
    setTotalQuantity(total);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addItem = async (product_id: number, quantity: number) => {
    await addToCart(db, product_id, quantity, user?.id);
    fetchCartItems();
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    await updateCartItemQuantity(db, cartItemId, quantity, user?.id);
    fetchCartItems();
  };

  const removeItem = async (cartItemId: number) => {
    await removeFromCart(db, cartItemId, user?.id);
    fetchCartItems();
  };

  const clear = async () => {
    await clearCart(db, user?.id);
    fetchCartItems();
  };

  return (
      <CartContext.Provider
      value={{
          cartItems,
          totalQuantity,
          addItem,
          updateQuantity,
          removeItem,
          clear,
      }}
      >
      {children}
      </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

const CartIconWidget = () => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  if (!user) return null;

  const itemsAmount = cartItems.length;
  return (
    <TouchableOpacity
      style={widgetStyles.container}
      onPress={() => router.navigate('cart')}
    >
      <FontAwesome name="shopping-cart" size={30} color="#000" />
      { itemsAmount > 0 && (
        <View style={widgetStyles.badge}>
          <Text style={widgetStyles.badgeText}>{itemsAmount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const widgetStyles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 20,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CartIconWidget;
