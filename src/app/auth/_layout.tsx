import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: 'Вход в аккаунт', headerShown: false, tabBarIcon: () => <FontAwesome name="sign-in" size={24} color="black"/> }}/>
            <Tabs.Screen name="register"  options={{ title: 'Регистрация', headerShown: false, tabBarIcon: () => <FontAwesome name="user-plus" size={24} color="black"/> }}/>
        </Tabs>
    )
}