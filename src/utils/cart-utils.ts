import { SQLiteDatabase } from "expo-sqlite";

export type ICartItem = {
  id: number;
  product_id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  quantityAvailable: number;
};

export const addToCart = async (db: SQLiteDatabase, productId: number, quantity: number, userId?: number) => {
  if (!userId) return;
  try {
    const cart = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM cart WHERE user_id = ?',
      [userId]
    );

    if (!cart) {
      await db.runAsync('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    }

    const cartId = cart?.id || (await db.getFirstAsync<{ id: number }>('SELECT id FROM cart WHERE user_id = ?', [userId]))?.id!;

    const existingItem = await db.getFirstAsync<ICartItem>(
      'SELECT * FROM cart_items join cart on cart.id = cart_items.cart_id WHERE product_id = ? AND cart.user_id = ? AND cart.id = ?',
      [productId, userId, cartId!]
    );

    if (existingItem) {
      await db.runAsync(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [existingItem.id!]
      );
    } else {
      await db.runAsync(
        'INSERT INTO cart_items (product_id, quantity, cart_id) VALUES (?, ?, ?)',
        [productId, quantity, cartId]
      );
    }
  } catch (error) {
    console.error('Ошибка при добавлении товара в корзину:', error);
  }
};

export const getCartItems = async (db: SQLiteDatabase, userId?: number) => {
  if (!userId) return [];
  try {
    const items = await db.getAllAsync<ICartItem>(
      `SELECT ci.id, ci.product_id, p.name, p.description, p.price, p.image, p.quantityAvailable, ci.quantity 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id
       JOIN cart c ON ci.cart_id = c.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return items;
  } catch (error) {
    console.error('Ошибка при получении товаров из корзины:', error);
    return [];
  }
};

export const removeFromCart = async (db: SQLiteDatabase, cartItemId: number, userId?: number) => {
  if (!userId) return;
  try {
    const cart = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM cart WHERE user_id = ?',
      [userId]
    );

    console.log(cart);
    if (!cart) return;

    await db.runAsync(
      'DELETE FROM cart_items WHERE id = ?',
      [cartItemId]
    );
  } catch (error) {
    console.error('Ошибка при удалении товара из корзины:', error);
  }
};

export const updateCartItemQuantity = async (db: SQLiteDatabase, cartItemId: number, quantity: number, userId?: number) => {
  if (!userId) return;
  try {
    const cart = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM cart WHERE user_id = ?',
      [userId]
    );
    if (!cart) return; 

    if (quantity <= 0) {
      await removeFromCart(db, cartItemId, userId);
    } else {
      await db.runAsync(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [cartItemId]
      );
    }
  } catch (error) {
    console.error('Ошибка при обновлении количества товара:', error);
  }
};


export const clearCart = async (db: SQLiteDatabase, userId?: number) => {
  if (!userId) return;
  try {
    const cart = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM cart WHERE user_id = ?',
      [userId]
    );
    if (cart) {
      await db.runAsync('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    }
  } catch (error) {
    console.error('Ошибка при очистке корзины:', error);
  }
};
