# Configuración de Variables de Entorno para Edge Functions

Para que las Edge Functions funcionen correctamente, necesitas configurar las siguientes variables de entorno en el dashboard de Supabase.

## Variables de Entorno Necesarias

Las variables que hay que configurar son las siguientes (evitando el prefijo SUPABASE_):

### Configuración SMTP para SendGrid

```
SMTP_HOSTNAME=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=TU_API_KEY_DE_SENDGRID
SMTP_FROM=cristianvillalobos666@gmail.com
```

### Información de la Empresa

```
APP_COMPANY_NAME=Tu Empresa Inmobiliaria
APP_COMPANY_PHONE=+56 9 1234 5678
APP_COMPANY_EMAIL=contacto@tudominio.com
APP_WEBSITE_URL=https://tudominio.com
```

## Pasos para configurar las variables

1. Inicia sesión en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a "Settings" (Configuración) en el menú de la izquierda
4. Selecciona "API" y luego la pestaña "Edge Functions"
5. En la sección "Environment Variables", agrega cada una de las variables mencionadas arriba

## Notas importantes

- No es necesario configurar manualmente `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` ya que estas variables son proporcionadas automáticamente por Supabase.
- Las variables que empiezan con `SUPABASE_` están reservadas por la plataforma.
- Por seguridad, después de configurar la API key de SendGrid, considera revocarla y generar una nueva si ha estado expuesta en archivos o repositorios.

## Comprobación

Para comprobar que las variables están configuradas correctamente:

1. Despliega las funciones Edge
2. Haz una prueba con datos de ejemplo
3. Revisa los logs para ver si hay algún error relacionado con variables de entorno

Si todo está configurado correctamente, deberías recibir los correos electrónicos de notificación sin problemas.
