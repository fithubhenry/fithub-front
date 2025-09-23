# Componente de Chat para FitHub

## Descripción
Este componente implementa un chat completo con interfaz flotante que utiliza la función `sendMessage` proporcionada.

## Características
- **Interfaz flotante**: Botón circular que se expande a una ventana de chat
- **Diseño responsive**: Optimizado para diferentes tamaños de pantalla
- **Indicadores visuales**: Loading states, timestamps, iconos de usuario/bot
- **Gestión de errores**: Manejo de errores de conexión y respuestas del servidor
- **Auto-scroll**: Desplazamiento automático a nuevos mensajes
- **Animaciones**: Transiciones suaves y indicadores de carga

## Integración

### 1. Componente principal
El chat está ubicado en `src/components/Chat/Chat.tsx` y ya está integrado en el layout principal de la aplicación.

### 2. Configuración de la URL
Actualmente, el chat apunta a `https://tu-backend.onrender.com/chat`. Cuando tengas tu endpoint listo, simplemente cambia esta URL en la función `sendMessage` dentro del componente.

```typescript
const sendMessage = async (userMessage: string) => {
  const res = await fetch("https://tu-dominio.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });

  const data = await res.json();
  return data.reply;
};
```

### 3. Uso
El chat aparece como un botón flotante en la esquina inferior derecha de todas las páginas. Los usuarios pueden:
- Hacer clic para abrir/cerrar el chat
- Enviar mensajes de texto
- Ver respuestas del bot con timestamps
- Ver indicadores de carga mientras se procesa la respuesta

## Estructura del componente

```
Chat/
├── Chat.tsx      # Componente principal
└── index.ts      # Export del componente
```

## Tipos de datos

```typescript
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
```

## Próximos pasos

1. **Backend**: Implementar el endpoint `/chat` que reciba `{ message: string }` y devuelva `{ reply: string }`
2. **Personalización**: Ajustar colores y estilos según la identidad de FitHub
3. **Funcionalidades adicionales**: 
   - Historial de conversaciones
   - Mensajes predefinidos
   - Integración con datos de usuario
   - Soporte para multimedia

## Dependencias utilizadas
- **React Icons**: Para iconos (ya instalado en tu proyecto)
- **Lucide React**: Para iconos modernos (ya instalado)
- **Tailwind CSS**: Para estilos (ya configurado)

El componente está listo para usar y se integrará automáticamente cuando implementes el endpoint del backend.