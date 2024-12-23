import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="cart"  options={{ title: 'Корзина', tabBarIcon: () => <FontAwesome name="shopping-cart" size={24} color="black"/> }}/>
            <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: () => <FontAwesome name="user" size={24} color="black"/> }}/>
            <Tabs.Screen name="orders" options={{ title: 'Заказы', tabBarIcon: () => <FontAwesome name="history" size={24} color="black"/> }}/>
        </Tabs>
    )
}