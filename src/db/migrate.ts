import { SQLiteDatabase } from "expo-sqlite";

const dropDatabase = async (db: SQLiteDatabase) => {
  const dropQuery = `
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS cart_items;
    DROP TABLE IF EXISTS cart;
  `;
  await db.execAsync(dropQuery);
};

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
  await dropDatabase(db);

  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      quantityAvailable INTEGER NOT NULL CHECK (quantityAvailable >= 0),
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_price REAL NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'pending', 'completed', 'cancelled')) DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      cart_id INTEGER NOT NULL,
      FOREIGN KEY (cart_id) REFERENCES cart (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )`;

  await db.execAsync(createTablesQuery);

  const insertDataQuery = `
    -- Добавление пользователей
    INSERT INTO users (id, name, email, password, role) VALUES 
      (1, 'Admin', 'stoleru.vadim@bk.ru', '123123', 'admin'),
      (2, 'User', 'stoleruvadim05@gmail.com', '123123', 'user');

    -- Добавление продуктов
    INSERT INTO products (name, description, price, quantityAvailable, image) VALUES 
      ('Product 1', 'Description of Product 1', 10.99, 5,'https://images.ctfassets.net.jpg'),
      ('Product 2', 'Description of Product 2', 19.99, 10,'https://example.com/product2.jpg'),
      ('Product 3', 'Description of Product 3', 29.99, 15,'https://example.com/product3.jpg'),
      ('Product 4', 'Description of Product 4', 39.99, 1,'https://example.com/product4.jpg'),
      ('Product 5', 'Description of Product 5', 49.99, 2,'https://example.com/product5.jpg'),
      ('Product 6', 'Description of Product 6', 59.99, 4,'https://example.com/product6.jpg'),
      ('Product 7', 'Description of Product 7', 69.99, 2,'https://example.com/product7.jpg'),
      ('Product 8', 'Description of Product 8', 79.99, 0,'https://example.com/product8.jpg'),
      ('Product 9', 'Description of Product 9', 89.99, 100,'https://example.com/product9.jpg'),
      ('Product 10', 'Description of Product 10', 99.99,50,'https://example.com/product10.jpg'),
      ('Product 11', 'Description of Product 11', 109.99, 20,'https://example.com/product11.jpg'),
      ('Product 12', 'Description of Product 12', 119.99, 30,'https://example.com/product12.jpg');

    -- Добавление заказов
    INSERT INTO orders (user_id, total_price, status, created_at) VALUES
      (1, 30.99, 'pending', '2023-08-01 10:00:00'),
      (2, 19.99, 'completed', '2023-08-02 15:30:00'),
      (3, 29.99, 'cancelled', '2023-10-02 16:30:00'),
      (4, 100, 'pending', '2023-10-02 16:30:00'),
      (5, 200, 'pending', '2023-12-02 16:30:00'),
      (6, 30000, 'pending', '2024-08-02 16:30:00'),
      (7, 10000, 'pending', '2024-09-02 16:30:00'),
      (8, 50000, 'pending', '2024-10-02 16:30:00'),
      (9, 200, 'pending', '2024-11-02 16:30:00'),
      (10, 200000, 'pending', '2024-12-02 16:30:00');


    -- Добавление позиций заказов
    INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
      (1, 1, 2, 21.98),
      (1, 2, 1, 19.99),
      (2, 3, 1, 29.99),
      (3, 1, 2, 21.98);
      
  `;
  await db.execAsync(insertDataQuery);
};
