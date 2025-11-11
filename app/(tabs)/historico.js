// app/(tabs)/historico.js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { getHistorico } from '../../api'; // Importa a função da API
import { FontAwesome } from '@expo/vector-icons'; 

// --- Componente para o Card do Pedido (Corrigido) ---
const CardPedido = ({ pedido }) => {
  const dataFormatada = new Date(pedido.data).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // ✅ CORREÇÃO: O 'itens_json' já é um objeto/array vindo do Postgres
  // Não precisamos mais de JSON.parse()
  const itens = pedido.itens_json || []; 

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitulo}>Pedido da Mesa {pedido.mesa_id}</Text>
          {pedido.cliente_nome && (
            <Text style={styles.cardCliente}>Cliente: {pedido.cliente_nome}</Text>
          )}
          {pedido.garcom_nome && (
            <Text style={styles.cardGarcom}>Atendido por: {pedido.garcom_nome}</Text>
          )}
        </View>
        <Text style={styles.cardData}>{dataFormatada}</Text>
      </View>
      
      <View style={styles.itensContainer}>
        {/* Usamos a variável 'itens' corrigida */}
        {Array.isArray(itens) && itens.map((item) => (
          <View key={item.item.id} style={styles.itemPedido}>
            <Text style={styles.itemQtd}>{item.quantidade}x</Text>
            <Text style={styles.itemNome}>{item.item.nome}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.cardTotal}>Total: R$ {pedido.total}</Text>
    </View>
  );
};


export default function HistoricoScreen() {
  
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const estaEmFoco = useIsFocused();

  // A FUNÇÃO DE FETCH (Não muda)
  async function fetchHistorico() {
    setIsLoading(true);
    try {
        const data = await getHistorico(); 
        setHistorico(data); 
        setError(null);
    } catch (error) {
        setError(error.message);
        Alert.alert("Erro de Conexão", "Não foi possível carregar o histórico.");
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (estaEmFoco) {
      fetchHistorico();
    }
  }, [estaEmFoco]);

  // RENDERIZAÇÃO CONDICIONAL (Não muda)
  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#633A21" /></View>;
  }
  if (error) {
    return <View style={styles.loadingContainer}><Text style={styles.errorText}>Erro: {error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={historico}
        renderItem={({ item }) => <CardPedido pedido={item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>📜 Histórico de Pedidos</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTexto}>Nenhum pedido finalizado ainda.</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS (Não mudam) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#dc2626', textAlign: 'center' },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyTexto: { fontSize: 16, color: '#5C4033' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    marginHorizontal: 16, marginTop: 16, padding: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1, borderColor: '#EFEBE4',
    paddingBottom: 12, marginBottom: 12,
  },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#3A291F' },
  cardCliente: { fontSize: 15, fontWeight: 'bold', color: '#3A291F', marginTop: 4 },
  cardGarcom: { fontSize: 14, fontWeight: '500', color: '#5C4033', marginTop: 2 },
  cardData: { 
    fontSize: 14, color: '#5C4033', flexShrink: 1, marginLeft: 8,
  },
  itensContainer: { gap: 8 },
  itemPedido: { flexDirection: 'row', alignItems: 'center' },
  itemQtd: { fontSize: 14, fontWeight: 'bold', color: '#633A21', marginRight: 8, width: 25 },
  itemNome: { flex: 1, fontSize: 14, color: '#4A372D' },
  cardTotal: {
    fontSize: 16, fontWeight: 'bold', color: '#3A291F',
    textAlign: 'right', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderColor: '#EFEBE4',
  },
});