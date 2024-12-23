import { useState, useRef, ReactNode, useContext, createContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { UserDropdown } from './user-dropdown';
import { useAuth } from './auth-provider';
import { NavbarLink } from './navbar-link';

const { width, height } = Dimensions.get('window');

interface NavbarContextProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const NavbarContext = createContext({} as NavbarContextProps);

export const NavbarProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavbarContext.Provider
      value={{ isOpen, toggleMenu: () => setIsOpen((prev) => !prev) }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbarContext = () => {
  return useContext(NavbarContext);
};

export const NavbarSwitcher = () => {
  const { isOpen, toggleMenu } = useNavbarContext();

  return (
    <TouchableOpacity style={styles.burger} onPress={toggleMenu}>
      <Text style={styles.burgerText}>{isOpen ? '✖' : '☰'}</Text>
    </TouchableOpacity>
  );
};


export const Navbar = () => {
  const { isOpen, toggleMenu } = useNavbarContext();
  const translateX = useRef(new Animated.Value(-width * 0.7)).current;
  const { user } = useAuth();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -width * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleOverlayPress = () => {
    if (isOpen) toggleMenu();
  };

  return (
    <>
      {isOpen && (
        <Pressable style={styles.overlay} onPress={handleOverlayPress} />
      )}

      <Animated.View
        style={[
          styles.navbar,
          { transform: [{ translateX }] },
        ]}
      >
        <View style={styles.user}>
          <UserDropdown />
        </View>
        <View style={styles.container}>
          <NavbarLink href="/">
            Главная
          </NavbarLink>
          <NavbarLink href="/catalog">
            Каталог
          </NavbarLink>
          {
            user && user.role === 'admin' && (
            <NavbarLink href="dashboard">
              Адимнка
            </NavbarLink>
          )}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  burger: {
    marginLeft: 10,
  },
  user: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLink: {
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 6,
    padding: 10,
    textAlign: 'center',
  },
  signOut: {
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 6,
  },
  burgerText: {
    fontSize: 24,
    color: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 100,
  },
  navbar: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.5,
    height: height,
    backgroundColor: '#ff3c00',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    zIndex: 101,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
