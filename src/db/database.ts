import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from "expo-sqlite";
import { User } from '@/types';
import { generateCode } from '@/utils/generate-code';
import axios from 'axios';


export const loginUser = async (db: SQLiteDatabase, email: string, code?: string): Promise<User> => {
    const user = await db.getFirstAsync<User>(
        `SELECT * FROM users WHERE email = ?;`, [email]
    );

    if (!user) {
        throw new Error("Неверный логин или пароль");
    }

    if (!code) {
      const result = send2FACode(db, email, "2FA код");
      if (!result) {
        throw new Error("Не удалось отправить код.");
      }
    } else {
      const result = await verify2FACode(db, email, code);
     if (!result) {
        throw new Error("Неверный код.");
      }
    }
  
    return user;
};


export const verify2FACode = async (db: SQLite.SQLiteDatabase, email: string, code: string): Promise<User | null> => {
  try {
    const query = `SELECT * FROM codes join users on codes.user_id = users.id WHERE email = ? AND code = ?;`;
    const user = await db.getFirstAsync<User | null>(query, [email, code]);
    return user;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return null;
  }
}


export const send2FACode = async (db: SQLite.SQLiteDatabase, email: string, name?: string) => {
  try {
    const code = generateCode();
    const query = `INSERT INTO codes (user_id, code) VALUES ((SELECT id FROM users WHERE email = ?), ?);`;
    await db.runAsync(query, [email, code]);
    
    const response = await axios.post("http://10.0.2.2:6000/notifications", [{
      type: "email",
      message: {
        to: email,
        name: name || "Код подтверждения",
        html: `<p>Ваш код подтверждения: ${code}</p>`,
        subject: "Код подтверждения",
        text: `Ваш код подтверждения: ${code}`,
      }
    }]); 
    
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error sending 2FA code:', error);
    return false;
  }
}


export const getAllUsers = async (db: SQLite.SQLiteDatabase) => {
  try {
    const query = `SELECT * FROM users`;
    const rows = await db.runAsync(query);
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

