// app/pedido/[mesaId].js
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

// 1. ✅ CORREÇÃO: O caminho sobe 2 níveis (de 'pedido' para 'app', de 'app' para a raiz)
import { getCardapio, finalizarPedido, liberarMesa } from '../../api'; 
// 2. ✅ CORREÇÃO: O caminho sobe 2 níveis
import { useAuth } from '../../context/AuthContext'; 

export default function PedidoScreen() {
  
  const { mesaId, clienteNome, garcomNome } = useLocalSearchParams();
  const router = useRouter();
  
  const { usuarioLogado, logout } = useAuth();
  const isClienteLogado = usuarioLogado?.tipo === 'cliente';

  const [carrinho, setCarrinho] = useState([]);
  const [cardapio, setCardapio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCardapio() {
      try {
        const data = await getCardapio();
        setCardapio(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCardapio();
  }, []); // '[]' = executa 1 vez

  // --- Funções do Carrinho ---
  
  function adicionarItem(item) {
    const itemNoCarrinho = carrinho.find(i => i.item.id === item.id);
    const qtdNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

    let itemDoEstoque = null;
    for (const categoria of cardapio) {
      itemDoEstoque = categoria.itens.find(i => i.id === item.id);
      if (itemDoEstoque) break;
    }
    if (!itemDoEstoque) return;

    if (qtdNoCarrinho >= itemDoEstoque.qtdEstoque) {
      Alert.alert("Esgotado!", `Não há mais "${item.nome}" em estoque.`);
      return;
    }

    setCarrinho(carrinhoAtual => {
      if (itemNoCarrinho) {
        return carrinhoAtual.map(i => 
          i.item.id === item.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...carrinhoAtual, { item: item, quantidade: 1 }];
    });
  }
  
  function diminuirItem(item) { setCarrinho(carrinhoAtual => { const itemNoCarrinho = carrinhoAtual.find(i => i.item.id === item.id); if (!itemNoCarrinho) return carrinhoAtual; if (itemNoCarrinho.quantidade === 1) { return carrinhoAtual.filter(i => i.item.id !== item.id); } return carrinhoAtual.map(i => i.item.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i ); }); }
  function calcularTotal() { return carrinho.reduce((total, { item, quantidade }) => { return total + (item.precoVal * quantidade); }, 0).toFixed(2); }
  function calcularTotalItens() { return carrinho.reduce((total, { quantidade }) => total + quantidade, 0); }


  // --- BOTÃO 1: FINALIZAR PEDIDO (API 'POST') ---
  async function handleFinalizarPedido() {
    const totalItens = calcularTotalItens();
    if (totalItens === 0) {
      Alert.alert("Carrinho vazio", "Adicione pelo menos um item.");
      return;
    }
    
    setIsSubmitting(true);

    const novoPedido = {
      id: String(Date.now()),
      mesaId: mesaId,
      clienteNome: clienteNome,
      garcomNome: garcomNome,
      itens: carrinho,
      total: calcularTotal(),
      data: new Date().toISOString(),
    };
    
    try {
      await finalizarPedido(novoPedido);
      setCarrinho([]);
      
      const novoCardapio = cardapio.map(cat => ({
        ...cat,
        itens: cat.itens.map(item => {
          const itemCarrinho = carrinho.find(i => i.item.id === item.id);
          if (itemCarrinho) {
            return { ...item, qtdEstoque: item.qtdEstoque - itemCarrinho.quantidade };
          }
          return item;
        })
      }));
      setCardapio(novoCardapio);

      router.push('/pedido-finalizado');

    } catch (error) {
      Alert.alert("Erro", `Não foi possível salvar o pedido: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- BOTÃO 2: ENCERRAR MESA (API 'PUT' + Lógica de Logout) ---
  async function handleEncerrarMesa() {
    setIsSubmitting(true);
    
    try {
      await liberarMesa(mesaId);
      
      if (isClienteLogado) {
        setIsSubmitting(false); // Para o loading
        Alert.alert(
          "Obrigado!", 
          "Mesa encerrada. Volte sempre!",
          [{ 
            text: 'OK', 
            onPress: () => {
              logout();
              router.replace('/LoginScreen');
            }
          }]
        );
      } else {
        setIsSubmitting(false); // Para o loading
        router.replace({
          pathname: '/(tabs)/clientes',
          params: { feedback: `Mesa ${mesaId} encerrada com sucesso.` }
        });
      }

    } catch (error) {
      Alert.alert("Erro", `Não foi possível liberar a mesa: ${error.message}`);
      setIsSubmitting(false);
    }
  }

  // --- Componente ItemCardapio (com info de estoque) ---
  const ItemCardapio = ({ item }) => {
    const itemNoCarrinho = carrinho.find(i => i.item.id === item.id);
    const quantidade = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;
    
    let itemDoEstoque = null;
    for (const categoria of cardapio) {
      itemDoEstoque = categoria.itens.find(i => i.id === item.id);
      if (itemDoEstoque) break;
    }
    if (!itemDoEstoque) return null;
    
    const esgotado = itemDoEstoque.qtdEstoque <= 0;
    const estoqueDisponivel = itemDoEstoque.qtdEstoque - quantidade;

    return (
      <View style={[styles.itemContainer, (esgotado && estoqueDisponivel <= 0) && styles.itemEsgotado]}>
        <View style={styles.itemTexto}>
          <Text style={styles.itemNome}>{item.nome}</Text>
          <Text style={styles.itemDesc}>{item.desc}</Text>
          <Text style={styles.itemPreco}>{item.preco}</Text>
          <Text style={estoqueDisponivel <= 0 ? styles.estoqueEsgotado : styles.estoque}>
            {estoqueDisponivel <= 0 ? "Esgotado" : `Disponível: ${estoqueDisponivel}`}
          </Text>
        </View>
        <View style={styles.botoesContainer}>
          {quantidade > 0 && (
            <Pressable style={styles.botaoAcao} onPress={() => diminuirItem(item)} disabled={isSubmitting}>
              <Text style={styles.botaoAcaoTexto}>-</Text>
            </Pressable>
          )}
          {quantidade > 0 && (
            <Text style={styles.quantidadeTexto}>{quantidade}</Text>
          )}
          {estoqueDisponivel > 0 && (
            <Pressable style={styles.botaoAcao} onPress={() => adicionarItem(item)} disabled={isSubmitting}>
              <Text style={styles.botaoAcaoTexto}>+</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };
  
  const CabecalhoCategoria = ({ titulo }) => ( <View style={styles.categoriaContainer}><Text style={styles.categoriaTitulo}>{titulo}</Text></View> );
  const renderItem = ({ item }) => ( <View>{item.itens.map((subItem) => ( <ItemCardapio key={subItem.id} item={subItem} /> ))}</View> );

  // RENDERIZAÇÃO
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
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }
  
  const totalItens = calcularTotalItens();
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cardapio}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>Pedido da Mesa {mesaId}</Text>
            <Text style={styles.subtitle}>Cliente: {clienteNome}</Text>
            <Text style={styles.subtitleGarcom}>Garçom: {garcomNome}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 160 }}
        extraData={carrinho}
      />
      
      <View style={styles.rodape}>
        <View style={styles.rodapeTotalContainer}>
          <Text style={styles.rodapeTitulo}>Total do Pedido:</Text>
          <Text style={styles.rodapeTotal}>
            R$ {calcularTotal()} ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
          </Text>
        </View>
        <View style={styles.rodapeBotoesContainer}>
          <Pressable 
            style={[styles.rodapeBotao, styles.botaoEncerrar, isSubmitting && styles.botaoDesativado]} 
            onPress={handleEncerrarMesa}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#dc2626" /> : <Text style={[styles.rodapeBotaoTexto, styles.botaoEncerrarTexto]}>Encerrar Mesa</Text>}
          </Pressable>
          <Pressable 
            style={[styles.rodapeBotao, styles.botaoFinalizar, isSubmitting && styles.botaoDesativado]} 
            onPress={handleFinalizarPedido}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.rodapeBotaoTexto}>Finalizar Pedido</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#5C4033' },
  errorText: { color: '#dc2626', textAlign: 'center' },
  header: { padding: 16, gap: 4 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3A291F' },
  subtitle: { fontSize: 18, fontWeight: '500', color: '#5C4033' }, 
  subtitleGarcom: { fontSize: 16, fontWeight: '400', color: '#633A21' }, 
  categoriaContainer: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, backgroundColor: '#EFEBE4' },
  categoriaTitulo: { fontSize: 18, fontWeight: '700', color: '#3A291F' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#EFEBE4' },
  itemTexto: { flex: 1, paddingRight: 12 },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#4A372D' },
  itemDesc: { fontSize: 14, color: '#775C4E', marginTop: 2 },
  itemPreco: { fontSize: 16, fontWeight: 'bold', color: '#633A21', marginTop: 4 },
  botoesContainer: { flexDirection: 'row', alignItems: 'center' },
  botaoAcao: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#633A21', justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  botaoAcaoTexto: { color: 'white', fontWeight: 'bold', fontSize: 20, lineHeight: 22 },
  quantidadeTexto: { fontSize: 18, fontWeight: 'bold', color: '#3A2F1F', minWidth: 20, textAlign: 'center' },
  rodape: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderColor: '#D7D0C8', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, gap: 12 },
  rodapeTotalContainer: { alignItems: 'center' },
  rodapeTitulo: { fontSize: 14, color: '#5C4033' },
  rodapeTotal: { fontSize: 24, fontWeight: 'bold', color: '#3A291F' },
  rodapeBotoesContainer: { flexDirection: 'row', gap: 12 },
  rodapeBotao: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  rodapeBotaoTexto: { color: 'white', fontWeight: '600', fontSize: 16 },
  botaoFinalizar: { backgroundColor: '#633A21' },
  botaoEncerrar: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#dc2626' },
  botaoEncerrarTexto: { color: '#dc2626' },
  botaoDesativado: { backgroundColor: '#d1d5db' },
  itemEsgotado: { backgroundColor: '#f1f5f9', opacity: 0.6 },
  estoque: { fontSize: 14, color: '#166534', fontWeight: '500', marginTop: 4 },
  estoqueEsgotado: { fontSize: 14, color: '#dc2626', fontWeight: 'bold', marginTop: 4 }
});