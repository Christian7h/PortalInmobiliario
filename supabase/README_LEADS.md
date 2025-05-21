# Sistema de Gestión de Leads para Portal Inmobiliario

Este documento explica cómo funciona el sistema completo de gestión de leads (prospectos) implementado en el portal inmobiliario.

## Componentes del Sistema

El sistema de gestión de leads consta de varios componentes:

### 1. Backend (Supabase)

- **Tablas**: 
  - `leads`: Almacena la información de los contactos realizados
  - `lead_activities`: Registra todas las actividades relacionadas con cada lead (notificaciones, seguimientos)

- **Edge Functions**:
  - `send-lead-notification`: Envía un correo electrónico al agente cuando se recibe un nuevo lead
  - `send-lead-auto-response`: Envía un correo electrónico automático de respuesta al cliente

### 2. Frontend (React)

- **Formularios de contacto**: Permiten a los usuarios enviar consultas desde diferentes partes de la aplicación
- **Sistema de notificaciones Toast**: Proporciona feedback visual al usuario
- **Panel de administración**: Permite gestionar y hacer seguimiento de los leads recibidos

## Flujo de Funcionamiento

1. Un usuario completa el formulario de contacto con sus datos y envía una consulta
2. La aplicación front-end crea un nuevo lead en la base de datos
3. Se activan dos notificaciones por correo electrónico:
   - Una notificación al agente inmobiliario sobre el nuevo lead
   - Una respuesta automática al cliente confirmando la recepción de su consulta
4. El usuario recibe una notificación visual (Toast) confirmando el envío exitoso
5. El lead queda registrado en el panel de administración para su seguimiento

## Configuración de los Encabezados CORS

Las Edge Functions de Supabase utilizan los siguientes encabezados CORS para permitir solicitudes desde cualquier origen:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

## Manejo de Errores

El sistema implementa un manejo resiliente de errores:

1. Los errores en las notificaciones por correo no interrumpen el flujo principal de la aplicación
2. Todos los errores son registrados para su posterior análisis
3. Se proporcionan mensajes de error visuales al usuario cuando es apropiado

## Sistema de Notificaciones Toast

Se ha implementado un sistema de notificaciones Toast para proporcionar feedback visual al usuario:

- **Tipos de notificaciones**: 
  - `success`: Para acciones completadas con éxito
  - `error`: Para errores y problemas
  - `info`: Para información general

- **Uso**:
  ```typescript
  import { useToast } from '../context/useToast';
  
  const { showToast } = useToast();
  
  // Mostrar una notificación de éxito
  showToast('Mensaje enviado con éxito', 'success');
  
  // Mostrar una notificación de error
  showToast('Error al enviar mensaje', 'error');
  
  // Mostrar una notificación informativa
  showToast('Procesando solicitud...', 'info');
  ```

## Despliegue de Edge Functions

Para desplegar las Edge Functions, sigue estas instrucciones:

1. Asegúrate de tener instalado el CLI de Supabase: `npm install -g supabase`
2. Navega a la carpeta del proyecto: `cd project`
3. Configura las variables de entorno necesarias (ver README_EDGE_FUNCTIONS.md)
4. Despliega las funciones: `supabase functions deploy --project-ref TU_REFERENCIA_PROYECTO`

## Pruebas

Para verificar que el sistema funciona correctamente:

1. Envía un formulario de contacto desde la aplicación
2. Verifica que aparezca la notificación de éxito
3. Comprueba que el lead se registre en la base de datos
4. Verifica que se envíen los correos electrónicos esperados
5. Confirma que el lead aparezca en el panel de administración

## Contribuciones y Mejoras

El sistema ha sido diseñado para ser fácilmente extensible. Algunas mejoras futuras podrían incluir:

- Integración con CRM
- Sistema de seguimiento automatizado
- Mejora de las plantillas de correo electrónico
- Análisis de conversión de leads
