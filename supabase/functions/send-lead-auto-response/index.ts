// supabase/functions/send-lead-auto-response/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { corsHeaders } from "./cors.ts";

// Configuración del cliente SMTP para SendGrid
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
    console.log("Recibida solicitud para send-lead-auto-response");

    // Parsea el cuerpo de la solicitud
    const { to, name, propertyTitle, propertyId } = await req.json();
    
    console.log("Datos recibidos:", { to, name, propertyTitle, propertyId });

    // Verifica que todos los campos necesarios estén presentes
    if (!to || !name) {
      console.log("Error: Faltan datos requeridos");
      return new Response(JSON.stringify({ error: "Faltan datos requeridos" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      });
    }

    // Datos de la agencia inmobiliaria
    const companyName = Deno.env.get("APP_COMPANY_NAME") || "Portal Inmobiliario";
    const companyPhone = Deno.env.get("APP_COMPANY_PHONE") || "+56 9 1234 5678";
    const companyEmail = Deno.env.get("APP_COMPANY_EMAIL") || "contacto@tudominio.com";
    const websiteUrl = Deno.env.get("APP_WEBSITE_URL") || "https://tudominio.com";
    
    console.log("Variables de entorno:", { 
      companyName, 
      companyPhone, 
      companyEmail, 
      websiteUrl,
      smtpFrom: Deno.env.get("SMTP_FROM")
    });

    // Construye el cuerpo del correo HTML
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #d97706;">Gracias por contactarnos, ${name}</h2>
        
        <p>Hemos recibido tu solicitud de información ${propertyTitle ? `sobre la propiedad "${propertyTitle}"` : ''}. Un asesor inmobiliario se pondrá en contacto contigo a la brevedad para ayudarte con todas tus consultas.</p>
        
        ${propertyId ? `
        <p>Puedes revisar la información de la propiedad en el siguiente enlace:</p>
        <p><a href="${websiteUrl}/propiedad/${propertyId}" style="color: #d97706;">Ver detalles de la propiedad</a></p>
        ` : ''}
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Datos de contacto:</strong></p>
          <p><strong>${companyName}</strong></p>
          <p>Teléfono: ${companyPhone}</p>
          <p>Email: ${companyEmail}</p>
          <p>Web: <a href="${websiteUrl}" style="color: #d97706;">${websiteUrl}</a></p>
        </div>
        
        <p>Atentamente,</p>
        <p>El equipo de ${companyName}</p>
      </div>
    `;
    
    console.log("Intentando enviar correo a:", to);    try {
      // Verificar que tenemos todos los datos de SMTP
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
        subject: `Recibimos tu consulta - ${companyName}`,
        content: `Gracias por contactarnos, ${name}`,
        html: emailBody,
      });
      
      console.log("Correo enviado con éxito a", to);
      
      // Responde con éxito
      return new Response(JSON.stringify({ 
        success: true,
        message: "Correo de auto-respuesta enviado correctamente"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    } catch (emailError) {
      console.error("Error al enviar correo:", emailError);
      console.error("Detalles del error:", JSON.stringify(emailError, null, 2));
      
      // Buscamos pistas específicas de SendGrid en el error
      let errorTipo = "error_desconocido";
      let solucionRecomendada = "Revisa la configuración SMTP";
      
      if (emailError.message?.includes("Invalid login")) {
        errorTipo = "credenciales_invalidas";
        solucionRecomendada = "Verifica que SMTP_USERNAME sea 'apikey' y SMTP_PASSWORD sea tu API Key de SendGrid";
      } else if (emailError.message?.includes("not match a verified Sender")) {
        errorTipo = "remitente_no_verificado";
        solucionRecomendada = "Verifica que la dirección en SMTP_FROM coincida exactamente con la que verificaste en SendGrid";
      } else if (emailError.message?.includes("Cannot connect")) {
        errorTipo = "conexion_fallida";
        solucionRecomendada = "Verifica que SMTP_HOSTNAME y SMTP_PORT sean correctos";
      }
      
      return new Response(JSON.stringify({ 
        error: "Error al enviar correo", 
        details: emailError.message,
        tipo: errorTipo,
        solucion: solucionRecomendada
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error general:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
