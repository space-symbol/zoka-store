
import { Link, LinkProps } from 'expo-router';
import { ReactNode } from 'react';
import { useNavbarContext } from './navbar';
import { StyleSheet } from 'react-native';

interface NavbarLinkProps extends LinkProps {
    children: ReactNode;
  }
  
export const NavbarLink = (props: NavbarLinkProps) => {
    const { children, onPress, ...otherProps } = props;
    const { toggleMenu } = useNavbarContext();
    return (
        <Link onPress={(e) => {
        toggleMenu();
        onPress?.(e);
        }} style={styles.link} {...otherProps}>
        {children}
        </Link>
    );
};

const styles = StyleSheet.create({
        link: {
        fontWeight: 'bold',
        paddingVertical: 15,
        fontSize: 18,
        color: '#fff',
        textDecorationLine: 'none',
    },
});
  
