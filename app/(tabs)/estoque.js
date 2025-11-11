// app/(tabs)/estoque.js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { getCardapio, adicionarEstoque } from '../../api'; // Importa as funções da API
import { FontAwesome } from '@expo/vector-icons'; 

// --- Componente para renderizar cada item ---
const RenderItemEstoque = ({ item, onAdicionarEstoque }) => {
  let estiloEstoque = styles.estoqueOk;
  let textoEstoque = `${item.qtdEstoque} em estoque`;

  if (item.qtdEstoque === 0) {
    estiloEstoque = styles.estoqueEsgotado;
    textoEstoque = 'ESGOTADO';
  } else if (item.qtdEstoque <= 5) {
    estiloEstoque = styles.estoqueBaixo;
    textoEstoque = `Baixo Estoque (${item.qtdEstoque})`;
  }

  return (
    <View style={styles.itemContainer}>
      <FontAwesome name="circle" size={16} color={estiloEstoque.color} style={styles.itemIcone} />
      
      <View style={styles.itemTexto}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={[styles.itemEstoque, estiloEstoque]}>{textoEstoque}</Text>
      </View>
      
      {/* Botão para adicionar estoque */}
      <Pressable 
        style={styles.botaoAdicionar} 
        onPress={() => onAdicionarEstoque(item)}
      >
        <FontAwesome name="plus" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};


export default function EstoqueScreen() {
  
  const [itensEstoque, setItensEstoque] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const estaEmFoco = useIsFocused();

  // 2. Função para buscar os dados do servidor
  async function fetchEstoque() {
    setIsLoading(true);
    try {
        const cardapioCompleto = await getCardapio(); 
        
        let todosOsItens = [];
        cardapioCompleto.forEach(categoria => todosOsItens.push(...categoria.itens));
        
        todosOsItens.sort((a, b) => a.qtdEstoque - b.qtdEstoque);
        setItensEstoque(todosOsItens);
        setError(null);
        
    } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        setError("Não foi possível conectar ao servidor.");
    } finally {
        setIsLoading(false);
    }
  }

  // 3. Efeito para carregar os dados
  useEffect(() => {
    if (estaEmFoco) {
      fetchEstoque();
    }
  }, [estaEmFoco]);

  // 4. A FUNÇÃO DE ADICIONAR (Com correção para Web/Native)
  async function handleAdicionarEstoque(item) {
    
    const promptMessage = `Quantas unidades de "${item.nome}" deseja adicionar?`;
    
    const obterQuantidade = () => {
      return new Promise((resolve) => {
        if (Platform.OS === 'web') {
          const textoQuantidade = window.prompt(promptMessage, "10");
          resolve(textoQuantidade);
          return;
        }
        Alert.prompt(
          "Adicionar Estoque",
          promptMessage,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
            { text: 'Adicionar', onPress: resolve }
          ],
          'plain-text', '', 'number-pad'
        );
      });
    };

    const textoQuantidade = await obterQuantidade();

    if (!textoQuantidade) return;
    
    const quantidade = parseInt(textoQuantidade, 10);
    
    if (isNaN(quantidade) || quantidade <= 0) {
      Alert.alert("Erro", "Por favor, insira um número positivo.");
      return;
    }

    try {
        await adicionarEstoque(item.id, quantidade);
        Alert.alert("Sucesso", `${quantidade} unidades de "${item.nome}" adicionadas e salvas!`);
        fetchEstoque(); // Recarrega os dados
    } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar o estoque no servidor.");
    }
  }

  // 5. RENDERIZAÇÃO
  if (isLoading && itensEstoque.length === 0) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#633A21" /></View>;
  }
  if (error) {
    return <View style={styles.loadingContainer}><Text style={styles.errorText}>Erro: {error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={itensEstoque}
        renderItem={({ item }) => (
          <RenderItemEstoque 
            item={item} 
            onAdicionarEstoque={handleAdicionarEstoque} 
          />
        )}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={fetchEstoque}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>📦 Gestão de Estoque</Text>
            <Text style={styles.subtitle}>Clique em [+] para adicionar estoque (Puxe para atualizar).</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 16, color: '#dc2626', fontWeight: 'bold' },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  subtitle: { fontSize: 16, color: '#5C4033', marginTop: 4 },
  itemContainer: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginTop: 12, padding: 16,
    borderRadius: 8, alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3,
  },
  itemIcone: { marginRight: 12 },
  itemTexto: { flex: 1 },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#3A291F' },
  itemEstoque: { fontSize: 14, fontWeight: 'bold' },
  botaoAdicionar: {
    backgroundColor: '#166534',
    width: 36, height: 36,
    borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 12,
  },
  estoqueEsgotado: { color: '#dc2626', fontWeight: 'bold' },
  estoqueBaixo: { color: '#f59e0b', fontWeight: 'bold' },
  estoqueOk: { color: '#166534', fontWeight: 'bold' },
});