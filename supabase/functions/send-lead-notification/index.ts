// supabase/functions/send-lead-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { corsHeaders } from "./cors.ts";

// Configura el cliente SMTP para enviar emails usando SendGrid
const smtp = new SMTPClient({
  connection: {
    hostname: Deno.env.get("SMTP_HOSTNAME") || "smtp.sendgrid.net",
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    tls: true,
    auth: {
      username: Deno.env.get("SMTP_USERNAME") || "apikey",
      password: Deno.env.get("SMTP_PASSWORD") || "",
    },
  },
});

serve(async (req) => {
  // Manejar la solicitud OPTIONS para CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Crea un cliente de Supabase usando las variables implícitas de Supabase Edge
    // Estas variables son inyectadas automáticamente por Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parsea el cuerpo de la solicitud
    const { leadId, to, leadName, leadEmail, leadPhone, leadMessage, propertyTitle, source } = await req.json();

    // Verifica que todos los campos necesarios estén presentes
    if (!to || !leadName || !leadEmail || !leadPhone) {
      return new Response(JSON.stringify({ error: "Faltan datos requeridos" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      });
    }    // Registra la acción de envío de correo en la tabla de actividades (opcional)
    // Manejar el caso en que la tabla no exista todavía
    try {
      // Verificar primero si la tabla existe
      const { error: tableError } = await supabase
        .from("lead_activities")
        .select("id")
        .limit(1);
        
      if (tableError) {
        console.log("La tabla lead_activities no existe o no está accesible, saltando registro de actividad");
      } else {
        await supabase
          .from("lead_activities")
          .insert([
            {
              lead_id: leadId,
              activity_type: "email_notification_sent",
              description: `Se envió notificación por correo a ${to}`,
            },
          ]);
      }
    } catch (dbError) {
      // Si hay un error con la tabla, continuamos de todas formas
      console.error("Error al registrar actividad:", dbError.message);
    }

    // Datos de la empresa
    const companyName = Deno.env.get("APP_COMPANY_NAME") || "Portal Inmobiliario";
    const websiteUrl = Deno.env.get("APP_WEBSITE_URL") || "https://tudominio.com";

    // Construye el cuerpo del correo HTML
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d97706;">Nuevo Lead Registrado</h2>
        <p>Se ha registrado un nuevo lead en la plataforma inmobiliaria:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Nombre:</strong> ${leadName}</p>
          <p><strong>Email:</strong> ${leadEmail}</p>
          <p><strong>Teléfono:</strong> ${leadPhone}</p>
          <p><strong>Mensaje:</strong> ${leadMessage}</p>
          <p><strong>Propiedad:</strong> ${propertyTitle}</p>
          <p><strong>Origen:</strong> ${source}</p>
        </div>
        
        <p>Accede al panel de administración para gestionar este lead:</p>
        <p><a href="${Deno.env.get("APP_WEBSITE_URL") || ""}/admin/leads" style="background-color: #d97706; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; display: inline-block;">Ver Lead</a></p>
      </div>
    `;    // Verificar que tenemos todos los datos de SMTP
    const smtpFrom = Deno.env.get("SMTP_FROM") || "noreply@tudominio.com";
      
    console.log("Configuración SMTP:", {
      hostname: Deno.env.get("SMTP_HOSTNAME"),
      port: Deno.env.get("SMTP_PORT"),
      username: Deno.env.get("SMTP_USERNAME"),
      passwordExists: Deno.env.get("SMTP_PASSWORD") ? "Sí" : "No",
      from: smtpFrom
    });
    
    // Envía el correo
    await smtp.send({
      from: smtpFrom,
      to,
      subject: `Nuevo Lead: ${leadName} - ${propertyTitle}`,
      content: "Nuevo lead registrado",
      html: emailBody,
    });
    
    console.log("Notificación enviada con éxito a", to);
    
    // Responde con éxito
    return new Response(JSON.stringify({ 
      success: true,
      message: "Notificación de lead enviada correctamente"
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Detalles del error:", JSON.stringify(error, null, 2));
    
    // Buscamos pistas específicas de SendGrid en el error
    let errorTipo = "error_desconocido";
    let solucionRecomendada = "Revisa la configuración SMTP";
    
    if (error.message?.includes("Invalid login")) {
      errorTipo = "credenciales_invalidas";
      solucionRecomendada = "Verifica que SMTP_USERNAME sea 'apikey' y SMTP_PASSWORD sea tu API Key de SendGrid";
    } else if (error.message?.includes("not match a verified Sender")) {
      errorTipo = "remitente_no_verificado";
      solucionRecomendada = "Verifica que la dirección en SMTP_FROM coincida exactamente con la que verificaste en SendGrid";
    } else if (error.message?.includes("Cannot connect")) {
      errorTipo = "conexion_fallida";
      solucionRecomendada = "Verifica que SMTP_HOSTNAME y SMTP_PORT sean correctos";
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      tipo: errorTipo,
      solucion: solucionRecomendada
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
