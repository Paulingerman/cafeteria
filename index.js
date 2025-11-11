// app/index.js
import { Redirect } from 'expo-router';

// Redireciona imediatamente para a tela de Login (o ponto de partida real)
export default function Index() {
  return <Redirect href="/LoginScreen" />;
}