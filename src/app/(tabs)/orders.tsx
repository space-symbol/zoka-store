import { useSQLiteContext } from "expo-sqlite";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { CustomButton } from "@/components/custom-button";
import { useAuth } from "@/components/auth-provider";


interface Order {
    id: number;
    created_at: string;
    total_price: number;
    status: Status;
    products: string;
}


export default function OrdersScreen() {
  const { user } = useAuth();
  const db = useSQLiteContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
      if (!user) return;
      const fetchOrders = async () => {
      try {
        const result = await db.getAllAsync<Order>(
          `SELECT orders.id, orders.created_at, orders.total_price, 
                  orders.status, 
                  GROUP_CONCAT(products.name) as products
           FROM orders 
           LEFT JOIN order_items ON orders.id = order_items.order_id 
           LEFT JOIN products ON order_items.product_id = products.id 
           WHERE orders.user_id = ?
           GROUP BY orders.id 
           ORDER BY orders.created_at DESC`,
          [user.id]
        );
        setOrders(result);
      } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, db]);

  if (!user) return <Redirect href="/auth" />;

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <Text style={styles.loading}>Загрузка...</Text>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>У вас пока нет заказов.</Text>
          <CustomButton
            variant="primary"
            title="Перейти к покупкам"
            onPress={() => router.push("/")}
          />
        </View>
      ) : (
        orders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Заказ #{order.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.orderStatus}>{getOrderStatusText(order.status)}</Text>
              <Text style={styles.orderProducts} numberOfLines={2}>
                {order.products}
              </Text>
              <Text style={styles.orderTotal}>
                {Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(
                  order.total_price
                )}
              </Text>
            </View>
            <Image
              source={{ uri: "https://via.placeholder.com/80x80" }}
              style={styles.orderImage}
            />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

type Status = "pending" | "shipped" | "delivered" | "cancelled";

function getOrderStatusText(status: Status) {
  switch (status) {
    case "pending":
      return "В обработке";
    case "shipped":
      return "Отправлен";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменён";
    default:
      return "Неизвестный статус";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  loading: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#666",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    marginBottom: 16,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#555",
    marginVertical: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: "#ef472c",
    fontWeight: "bold",
    marginBottom: 8,
  },
  orderProducts: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12,
  },
});
