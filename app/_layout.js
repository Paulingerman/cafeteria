// app/_layout.js
import { Stack } from 'expo-router';
// 1. Importa o AuthProvider do caminho correto (sobe 1 nível)
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        {/* 1. O PONTO DE PARTIDA PRINCIPAL: LoginScreen */}
        <Stack.Screen 
          name="LoginScreen"
          options={{ headerShown: false }}
        />
        
        {/* 2. O GRUPO DE ABAS (a pasta app/(tabs)) */}
        <Stack.Screen 
          name="(tabs)" // ⬅️ CORREÇÃO: Nome da pasta (sem 'main')
          options={{ headerShown: false }}
        />
        
        {/* 3. Telas de Pilha (Pedidos, Detalhes) */}
        <Stack.Screen 
          name="mesa-detalhe/[mesaId]" 
          options={{ 
            title: 'Detalhe da Mesa',
            headerBackTitle: 'Mesas',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="pedido/[mesaId]" 
          options={{ 
            title: 'Fazer Pedido',
            headerBackTitle: 'Detalhe'
          }} 
        />
        <Stack.Screen 
          name="pedido-finalizado" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}