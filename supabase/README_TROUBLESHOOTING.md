# Solución de Problemas con Edge Functions

Este documento proporciona información para solucionar problemas comunes con las Edge Functions de Supabase en el sistema de notificaciones de leads.

## Problemas y Soluciones

### 1. Error 404 con la tabla lead_activities

El error `POST https://zyjsgmitgejdbuzcguls.supabase.co/rest/v1/lead_activities 404 (Not Found)` indica que la tabla `lead_activities` no existe en la base de datos.

**Solución:**
1. Aplica la migración `20250519125400_add_lead_activities_table.sql` a tu base de datos:
   - Desde el dashboard de Supabase, ve a SQL Editor
   - Copia y pega el contenido del archivo de migración
   - Ejecuta la consulta

O bien, ejecuta:
```bash
supabase db push --db-url="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 2. Error 500 en las Edge Functions

Si tus Edge Functions devuelven un error 500, puede haber varios problemas:

**Soluciones:**
1. **Verifica las variables de entorno:**
   - Asegúrate de que todas las variables estén configuradas correctamente en el Dashboard de Supabase:
     ```
     SMTP_HOSTNAME=smtp.sendgrid.net
     SMTP_PORT=587
     SMTP_USERNAME=apikey
     SMTP_PASSWORD=TU_API_KEY_DE_SENDGRID
     SMTP_FROM=tu-email@dominio.com
     APP_COMPANY_NAME=Tu Empresa Inmobiliaria
     APP_COMPANY_PHONE=+56 9 1234 5678
     APP_COMPANY_EMAIL=contacto@tudominio.com
     APP_WEBSITE_URL=https://tudominio.com
     ```

2. **Verifica los logs de las Edge Functions:**
   - En el dashboard de Supabase, ve a Edge Functions, selecciona tu función y haz clic en "Logs"
   - Busca errores específicos que te ayuden a diagnosticar el problema

3. **Prueba las Edge Functions directamente:**
   - Desde el dashboard, puedes probar la función con datos de ejemplo:
   - Para `send-lead-notification`:
     ```json
     {
       "leadId": "123",
       "to": "tu@email.com",
       "leadName": "Cliente Prueba",
       "leadEmail": "cliente@ejemplo.com",
       "leadPhone": "+56 9 1234 5678",
       "leadMessage": "Estoy interesado en la propiedad",
       "propertyTitle": "Casa de prueba",
       "source": "website"
     }
     ```
   - Para `send-lead-auto-response`:
     ```json
     {
       "to": "cliente@ejemplo.com",
       "name": "Cliente Prueba",
       "propertyTitle": "Casa de prueba",
       "propertyId": "123"
     }
     ```

4. **Verifica la configuración de SendGrid:**
   - Asegúrate de que tu cuenta de SendGrid esté activa
   - Confirma que has verificado el dominio o al menos la dirección de correo del remitente
   - Verifica que la API key tenga permisos para enviar correos

## Manejo de Errores Silencioso

Recuerda que hemos implementado un manejo silencioso de errores en las notificaciones de leads. Esto significa que aunque las Edge Functions fallen, el proceso principal de creación de leads continuará funcionando. Los errores se registrarán en la consola pero no interrumpirán el flujo de la aplicación.

## Ajustes en el Código

Si necesitas personalizar el comportamiento del sistema de notificaciones:

1. **Para modificar las plantillas de correo:**
   - Edita los archivos `send-lead-notification/index.ts` y `send-lead-auto-response/index.ts`
   - Personaliza las variables de la plantilla HTML según tus necesidades

2. **Para cambiar la configuración de SMTP:**
   - Actualiza las variables de entorno en el dashboard de Supabase

## Comprobación del Funcionamiento

Para verificar que todo funciona correctamente:

1. Crea un nuevo lead desde la aplicación
2. Verifica que se registre en la base de datos
3. Comprueba en los logs de las Edge Functions si se procesaron correctamente
4. Verifica que los correos electrónicos se envíen tanto al cliente como al agente
