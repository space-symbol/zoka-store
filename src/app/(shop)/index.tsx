import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

const categories = [
  { id: '1', name: 'Двигатель' },
  { id: '2', name: 'Подвеска' },
  { id: '3', name: 'Тормоза' },
];

export default function ShopHome() {
  const router = useRouter();
  const db = useSQLiteContext()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Категории запчастей</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.navigate(`/category/${item.id}`)}
            style={styles.item}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  item: { padding: 12, backgroundColor: '#eee', marginBottom: 8, borderRadius: 6 },
});
