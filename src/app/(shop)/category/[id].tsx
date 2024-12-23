import { useLocalSearchParams, useRouter, useSearchParams } from 'expo-router/build/hooks';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const products = [
  { id: '1', name: 'Масляный фильтр', categoryId: '1' },
  { id: '2', name: 'Свечи зажигания', categoryId: '1' },
  { id: '3', name: 'Амортизатор', categoryId: '2' },
];

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const categoryProducts = products.filter((p) => p.categoryId === id);

  return (
    <View>
      <FlatList
        data={categoryProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // <Link href={`/product/${item.id}`}>
          <TouchableOpacity onPress={() => router.navigate(`/product/${item.id}`)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
          // </Link>
        )}
      />
    </View>
  );
}
