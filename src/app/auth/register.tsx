import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { generateCode } from "@/utils/generate-code";
import { send2FACode, verify2FACode } from "@/db/database";
import { useSQLiteContext } from "expo-sqlite";
import { useAuth } from "@/components/auth-provider";

export default function RegisterScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const db = useSQLiteContext();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");

  if (user) {
    const redirectTo = user.role === "admin" ? "admin/dashboard" : "/";
    return <Redirect href={redirectTo} />;
  }

  const handleRegister = async () => {
    if (!username || !email) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля.");
      return;
    }

    try {
      setLoading(true);
      const result = await send2FACode(db, email, "Код подтверждения почты");
      if (result) {
        Alert.alert("Успех", "Проверьте вашу почту.");
        setIsVerifying(true);
    } else {
        Alert.alert("Ошибка", "Не удалось отправить код. Попробуйте позже.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка", "Произошла ошибка при регистрации.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const result = await verify2FACode(db, email, code);
    if (result) {
      Alert.alert("Успех", "Вы успешно зарегистрированы.");
      router.navigate("/auth");
    } else {
      Alert.alert("Ошибка", "Неверный код подтверждения.");
    }      
  }

  return !isVerifying ? (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
      <TextInput
        style={styles.input}
        placeholder="Имя пользователя"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Загрузка..." : "Зарегистрироваться"}</Text>
      </TouchableOpacity>
      <Text style={styles.linkText}>
        Уже есть аккаунт? <Link style={styles.link} href="/auth">Войти</Link>
      </Text>
    </View>
    ) : (
      <View style={styles.container}>
      <Text style={styles.title}>Подтверждение кода</Text>
      <Text style={styles.info}>Введите код, отправленный на {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите код"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Проверяем..." : "Подтвердить"}</Text>
      </TouchableOpacity>
      <Text style={styles.linkText}>
        Не получили код? <TouchableOpacity onPress={() => Alert.alert("Информация", "Функционал повтора кода в разработке.")}>
          <Text style={styles.link}>Отправить снова</Text>
        </TouchableOpacity>
      </Text>
    </View>
    )
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
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 24,
    textAlign: "center",
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
    backgroundColor: "#28a745",
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
