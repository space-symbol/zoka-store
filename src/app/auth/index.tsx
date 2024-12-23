import { Link, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as SQLite from "expo-sqlite"; 
import { loginUser } from "@/db/database"; 
import { useAuth } from "@/components/auth-provider";
import { CustomButton } from "@/components/custom-button";

export default function LoginScreen() {
  const { user, setUser } = useAuth();
  const db = SQLite.useSQLiteContext();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false); 

  
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  
  if (user) {
    const redirectTo = user.role === "admin" ? "/dashboard" : "/";
    return <Redirect href={redirectTo} />;
  }

  
  const handleSendCode = async () => {
    if (!email) {
      setError("Введите email.");
      return;
    }
    try {
      await loginUser(db, email); 
      setIsCodeSent(true); 
    } catch (error) {
      setError("Пользователь не найден.");
    }
  };

  
  const handleVerifyCode = async () => {
    if (!code) {
      setError("Введите код.");
      return;
    }
    try {
      const user = await loginUser(db, email, code); 
      if (user) {
        setUser(user); 
        Alert.alert("Успех", "Вы успешно авторизованы.");
      } else {
        setError("Неверный код.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Произошла ошибка.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      {!isCodeSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode}>
            <Text style={styles.buttonText}>Отправить код</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 8 }}>Код отправлен на {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите код"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <CustomButton title="Подтвердить" onPress={handleVerifyCode} />
          <CustomButton title="Отменить" onPress={() => setIsCodeSent(false)} />
        </>
      )}
      {error && <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>}
      <Text style={styles.linkText}>
        Нет аккаунта? <Link style={styles.link} href="auth/register">Зарегистрируйтесь</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#898989",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#ef472c",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 16,
    fontSize: 16,
  },
  link: {
    color: "#007bff",
    textDecorationLine: "underline",
    cursor: "pointer",
  },
});
