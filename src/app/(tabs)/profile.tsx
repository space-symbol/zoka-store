import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/components/auth-provider';
import { CustomButton } from '@/components/custom-button';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const db = useSQLiteContext();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);


  const logout = () => {
    setUser(null);
  }

  // TODO: добавить функцию обновления почты с кодом подтверждения
  const updateEmail = async (newEmail: string) => {
  }
  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Ошибка', 'Введите новый адрес электронной почты.');
      return;
    }
    setLoading(true);
    try {
      await updateEmail(newEmail.trim());
      Alert.alert('Успех', 'Адрес электронной почты успешно обновлён.');
      setIsEditingEmail(false);
    } catch (error) {
      console.error('Ошибка при обновлении почты:', error);
      Alert.alert('Ошибка', 'Не удалось обновить адрес электронной почты.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('auth');
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Профиль</Text>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Ваше имя</Text>
        <Text style={styles.value}>{user.username || 'Имя не указано'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.label}>Электронная почта</Text>
        {isEditingEmail ? (
          <View style={styles.emailEditContainer}>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Введите новый email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <CustomButton
              title={loading ? 'Сохранение...' : 'Сохранить'}
              variant="primary"
              onPress={handleEmailChange}
              disabled={loading}
            />
            <TouchableOpacity onPress={() => setIsEditingEmail(false)}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emailRow}>
            <Text style={styles.value}>{email}</Text>
            <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
              <Text style={styles.editText}>Изменить</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CustomButton
        title="Выйти из аккаунта"
        variant="secondary"
        onPress={logout}
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoSection: {
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
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailEditContainer: {
    flexDirection: 'column',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  editText: {
    color: '#007bff',
    fontSize: 16,
  },
  cancelText: {
    color: '#ff4d4f',
    fontSize: 14,
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: 24,
  },
});
