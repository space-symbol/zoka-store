import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Button,
} from 'react-native';
import { useNavbarContext } from './navbar';
import { CustomButton } from './custom-button';
import { useAuth } from './auth-provider';
import { NavbarLink } from './navbar-link';

const getRandomAvatar = (name?: string) =>
  `https://ui-avatars.com/api/?background=random&name=${name}`;

export const UserDropdown = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { toggleMenu: toggleNavbar } = useNavbarContext()
  const {user, setUser } = useAuth();
  const avatarUrl = user
    ? user.avatarUrl || getRandomAvatar(user.username)
    : getRandomAvatar("?");

  const toggleMenu = () => setIsMenuVisible((prev) => !prev);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsMenuVisible(false)}>
          <View style={styles.menu}>
            {user ? (
              <>
                <Text style={styles.title}>{user.username}</Text>
                <NavbarLink onPress={toggleMenu} href={'/profile'} style={styles.menuItem}>Профиль</NavbarLink>
                <NavbarLink onPress={toggleMenu} href={'/cart'} style={styles.menuItem}>Корзина</NavbarLink>
                <CustomButton variant='secondary' title='Выход' onPress={() => {
                  toggleNavbar();
                  setUser(null);
                }} />
              </>
            ) : (
              <>
                <NavbarLink onPress={toggleMenu} href={'auth'} style={styles.menuItem}>Войти</NavbarLink>
                <NavbarLink onPress={toggleMenu} href={'auth/register'} style={styles.menuItem}>Зарегистрироваться</NavbarLink>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    position: 'relative',
  },
  exitButton: {
    color: 'red',
    backgroundColor: 'transparent',  
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
});
