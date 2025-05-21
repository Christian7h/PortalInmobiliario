# Configuración de SendGrid para Notificaciones por Email

Esta guía te ayudará a configurar SendGrid como servicio de email para tus Edge Functions de Supabase.

## 1. Crear una cuenta en SendGrid

Si aún no lo has hecho:
1. Visita [SendGrid](https://sendgrid.com/) y crea una cuenta gratuita
2. La cuenta gratuita permite enviar hasta 100 emails diarios

## 2. Verificar tu Remitente

Antes de enviar correos, debes verificar al menos una dirección de correo:

1. En el panel de SendGrid, ve a **Settings → Sender Authentication**
2. Selecciona **Verify a Single Sender** para una dirección específica
3. Completa el formulario con la información requerida:
   - **From Name**: Nombre que verán los destinatarios (ej. "Portal Inmobiliario")
   - **From Email Address**: Correo desde el que enviarás (ej. "notificaciones@tudominio.com")
   - **Reply To**: Correo para respuestas (puede ser el mismo)
   - **Company Address**: Dirección física de tu empresa
   - **City, State, Zip Code, Country**: Información de ubicación
4. Recibirás un correo de verificación, haz clic en el enlace para confirmar

## 3. Generar una API Key para SMTP

1. En el panel de SendGrid, ve a **Settings → API Keys**
2. Haz clic en **Create API Key**
3. Configura tu API Key:
   - **API Key Name**: "Supabase Email Notifications"
   - **API Key Permissions**: Selecciona "Restricted Access" y marca solo "Mail Send"
4. Haz clic en **Create & View**
5. **¡IMPORTANTE!** Copia inmediatamente tu API Key, pues solo se muestra una vez

## 4. Configurar las Variables de Entorno en Supabase

En el panel de Supabase, ve a **Database → Functions** y selecciona tu función:

1. Haz clic en **Settings** o **Variables**
2. Agrega las siguientes variables:

```
SMTP_HOSTNAME=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=TU_API_KEY_DE_SENDGRID
SMTP_FROM=tu-correo-verificado@tudominio.com
```

Y las variables de información de tu empresa:

```
APP_COMPANY_NAME=Tu Portal Inmobiliario
APP_COMPANY_PHONE=+56 9 1234 5678
APP_COMPANY_EMAIL=contacto@tudominio.com
APP_WEBSITE_URL=https://tudominio.com
```

## 5. Probar el Envío de Correos

Después de configurar todo, puedes probar tus funciones usando el script de prueba:

```bash
# PowerShell
$env:SUPABASE_URL = "https://tu-proyecto.supabase.co"
$env:SUPABASE_ANON_KEY = "tu-clave-anon"
node test-edge-functions.js
```

## Solución de Problemas Comunes

### Error "API Key does not have permission to send email"
- Asegúrate de que tu API Key tenga permisos de "Mail Send"
- Verifica que hayas copiado correctamente la API Key

### Error "The from address does not match a verified Sender Identity"
- Verifica que la dirección en SMTP_FROM sea exactamente la misma que verificaste
- Si usas un dominio personalizado, debes verificar todo el dominio

### Error "Connection refused" o "Timeout"
- Verifica que SMTP_HOSTNAME y SMTP_PORT sean correctos
- Confirma que no haya restricciones de red en tu entorno

### Error "Invalid login credentials"
- Confirma que SMTP_USERNAME sea exactamente "apikey" (no tu email)
- Verifica que SMTP_PASSWORD sea tu API Key de SendGrid
