// app/(tabs)/cardapio.js (A SEGUNDA ABA)
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
// 1. Importa a função da API
import { getCardapio } from '../../api'; 

// --- Componentes ---
const CabecalhoCategoria = ({ titulo }) => (
  <View style={styles.categoriaContainer}>
    <Text style={styles.categoriaTitulo}>{titulo}</Text>
  </View>
);

const ItemCardapio = ({ nome, preco, desc, qtdEstoque }) => {
  const esgotado = qtdEstoque <= 0;
  return (
    <View style={[styles.itemContainer, esgotado && styles.itemEsgotado]}>
      <View style={styles.itemTexto}>
        <Text style={styles.itemNome}>{nome}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
        <Text style={esgotado ? styles.estoqueEsgotado : styles.estoque}>
          {esgotado ? "Esgotado" : `Em estoque: ${qtdEstoque}`}
        </Text>
      </View>
      <Text style={styles.itemPreco}>{preco}</Text>
    </View>
  );
};
// --- FIM DOS COMPONENTES ---

export default function CardapioScreen() {
  
  const [cardapio, setCardapio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const estaEmFoco = useIsFocused();

  // 2. Lógica de fetch (com anti-cache)
  async function fetchCardapio() {
    setIsLoading(true);
    try {
      const data = await getCardapio(); // Chama a função da API
      setCardapio(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (estaEmFoco) {
      fetchCardapio();
    }
  }, [estaEmFoco]); // Atualiza sempre que a aba fica visível

  // 3. RENDERIZAÇÃO CONDICIONAL
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#633A21" />
        <Text style={styles.loadingText}>A carregar cardápio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erro ao carregar o cardápio.</Text>
        <Text>Verifique se o seu `node server.js` está a correr.</Text>
      </View>
    );
  }

  // 4. A lista (como antes)
  const renderItem = ({ item }) => (
    <>
      <CabecalhoCategoria titulo={item.categoria} />
      {item.itens.map((subItem) => (
        <ItemCardapio 
          key={subItem.id} 
          nome={subItem.nome} 
          desc={subItem.desc} 
          preco={subItem.preco} 
          qtdEstoque={subItem.qtdEstoque}
        />
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cardapio}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>☕ Cardápio Completo</Text>
            <Text style={styles.subtitle}>Itens disponíveis (lidos do Postgres)</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        extraData={cardapio} // Garante atualização
      />
    </SafeAreaView>
  );
}

// 5. ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 12,
  },
  loadingText: { fontSize: 16, color: '#5C4033' },
  errorText: {
    fontSize: 16, color: '#dc2626', fontWeight: 'bold', textAlign: 'center',
  },
  header: { padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#5C4033' },
  categoriaContainer: {
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
    backgroundColor: '#EFEBE4', borderBottomWidth: 1,
    borderTopWidth: 1, borderColor: '#D7D0C8'
  },
  categoriaTitulo: { fontSize: 20, fontWeight: '700', color: '#3A291F' },
  itemContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderColor: '#EFEBE4',
  },
  itemTexto: { flex: 1, paddingRight: 12 },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#4A372D' },
  itemDesc: { fontSize: 14, color: '#775C4E', marginTop: 2 },
  itemPreco: { fontSize: 16, fontWeight: 'bold', color: '#633A21' },
  itemEsgotado: {
    backgroundColor: '#f1f5f9', opacity: 0.6,
  },
  estoque: {
    fontSize: 14, color: '#166534', fontWeight: '500', marginTop: 4,
  },
  estoqueEsgotado: {
    fontSize: 14, color: '#dc2626', fontWeight: 'bold', marginTop: 4,
  }
});