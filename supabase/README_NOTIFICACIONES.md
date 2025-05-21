# Configuración de Notificaciones para Leads

Este documento explica cómo configurar y desplegar las funciones de notificación por correo electrónico para el sistema de gestión de leads.

## Requisitos previos

1. Una cuenta de Supabase con Edge Functions habilitadas
2. Acceso a un servicio SMTP para envío de emails (SendGrid, Amazon SES, etc.)
3. Supabase CLI instalada

## Configuración de variables de entorno

1. Copia el archivo `.env.local` a `.env`:
   ```
   cp supabase/.env.local supabase/.env
   ```

2. Edita el archivo `.env` con tus credenciales SMTP y los datos de tu empresa:
   ```
   SMTP_HOSTNAME=smtp.tuservicio.com
   SMTP_PORT=587
   SMTP_USERNAME=tu_usuario
   SMTP_PASSWORD=tu_contraseña
   SMTP_FROM=noreply@tudominio.com
   
   COMPANY_NAME=Tu Empresa Inmobiliaria
   COMPANY_PHONE=+56 9 1234 5678
   COMPANY_EMAIL=contacto@tudominio.com
   WEBSITE_URL=https://tudominio.com
   ```

## Despliegue de las Edge Functions

1. Inicia sesión en Supabase CLI:
   ```
   supabase login
   ```

2. Establece el enlace a tu proyecto:
   ```
   supabase link --project-ref tu-referencia-de-proyecto
   ```

3. Despliega las Edge Functions:
   ```
   supabase functions deploy send-lead-notification --no-verify-jwt
   supabase functions deploy send-lead-auto-response --no-verify-jwt
   ```

## Pruebas

Para verificar que las notificaciones funcionan correctamente:

1. Crea un nuevo lead desde cualquier formulario de contacto
2. Verifica que el correo de notificación llegue a la dirección configurada
3. Verifica que el lead reciba un correo de respuesta automática

## Personalización de plantillas

Las plantillas HTML para los correos electrónicos están definidas directamente en las Edge Functions. Para cambiar el diseño o contenido, modifica las variables `emailBody` en los archivos:

- `supabase/functions/send-lead-notification/index.ts`
- `supabase/functions/send-lead-auto-response/index.ts`

Después de hacer cambios, vuelve a desplegar las funciones con los comandos mencionados anteriormente.
