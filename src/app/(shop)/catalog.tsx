import { CustomButton } from '@/components/custom-button';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/types';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet} from 'react-native';

export default function CatalogScreen() {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadProducts(query);
  }, [page, query]);

  const loadProducts = async (searchQuery: string) => {
    if (loading) return;
    setLoading(true);

    const offset = (page - 1) * PAGE_SIZE;

    const result = await db.getAllAsync<Product>(
      `SELECT * FROM products 
      WHERE name LIKE ? 
      LIMIT ? OFFSET ?`,
      [`%${searchQuery}%`, PAGE_SIZE, offset]
    );

    let total: number | undefined = 0
    if (searchQuery === '') {
      total = (await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM products`,
        [`%${searchQuery}%`]
      ))?.count;
    } else {
      total = (await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM products WHERE name LIKE ?`,
        [`%${searchQuery}%`]
      ))?.count;
    }
    
    setProducts(result);
    setTotalPages(Math.ceil(total ? total / PAGE_SIZE: 1));
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Каталог автозапчастей</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по названию..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Нет товаров</Text>}
        refreshing={loading}
      />
      <View style={styles.pagination}>
        <CustomButton
          title="Назад"
          onPress={handlePreviousPage}
          disabled={page === 1}
          variant='outline'
        />
        <Text style={styles.pageInfo}>
          {page} из {totalPages}
        </Text>
        <CustomButton
          variant='outline'
          title="Вперёд"
          onPress={handleNextPage}
          disabled={page === totalPages}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderColor: '#898989',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef472c',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

