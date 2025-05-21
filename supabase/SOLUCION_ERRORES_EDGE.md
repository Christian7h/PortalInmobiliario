# Solución de problemas con Edge Functions y notificaciones de leads

## Problema: Errores 500 en Edge Functions y tabla lead_activities no encontrada

Si estás experimentando errores 500 en las Edge Functions o problemas con la tabla `lead_activities`, sigue estos pasos para solucionarlos:

## 1. Aplicar la migración de base de datos

La tabla `lead_activities` es necesaria para el registro de actividades de leads. Si no existe, necesitas aplicar la migración:

```bash
# Desde la consola de SQL de Supabase
-- Ejecutar el contenido del archivo:
-- /supabase/migrations/20250519125400_add_lead_activities_table.sql
```

## 2. Configurar variables de entorno en Supabase

Las Edge Functions necesitan estas variables de entorno para funcionar correctamente:

```
# Configuración SMTP para envío de correos (usando SendGrid)
SMTP_HOSTNAME=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=tu-api-key-de-sendgrid
SMTP_FROM=notificaciones@tudominio.com

# Variables de la aplicación (SIN el prefijo SUPABASE_)
APP_COMPANY_NAME=Portal Inmobiliario
APP_COMPANY_PHONE=+56 9 1234 5678
APP_COMPANY_EMAIL=contacto@tudominio.com
APP_WEBSITE_URL=https://tudominio.com
```

⚠️ **Importante**: No uses el prefijo `SUPABASE_` para tus variables personalizadas, ya que está reservado.

## 3. Desplegar las Edge Functions

Después de hacer cambios, necesitas desplegar las funciones:

```bash
# Desde tu máquina de desarrollo
npx supabase functions deploy send-lead-notification --project-ref tu-ref-id
npx supabase functions deploy send-lead-auto-response --project-ref tu-ref-id
```

O desplegarlas desde el panel de Supabase:
1. Ve a "Edge Functions"
2. Sube los archivos actualizados
3. Despliega cada función

## 4. Probar las Edge Functions

Usa el script `test-edge-functions.js` para probar las funciones:

```bash
# Configura las variables de entorno primero
$env:SUPABASE_URL = "https://tu-proyecto.supabase.co"
$env:SUPABASE_ANON_KEY = "tu-clave-anon"

# Ejecuta el script
node test-edge-functions.js
```

## 5. Verificación del flujo completo

1. Completa un formulario de contacto en la aplicación
2. Verifica que el lead se haya creado en la base de datos
3. Comprueba que los correos se hayan enviado correctamente

## Problemas comunes:

1. **Error 500**: Revisa los logs de las Edge Functions en el panel de Supabase
2. **CORS**: Asegúrate de que los headers CORS estén correctamente configurados
3. **Variables de entorno**: Verifica que todas estén configuradas correctamente
4. **Tabla inexistente**: Ejecuta la migración para crear la tabla `lead_activities`
