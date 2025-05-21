# Edge Function Configurations

This file contains various configurations and setup requirements for the Supabase Edge Functions.

## CORS Configuration

The Edge Functions in this project use CORS headers to allow cross-origin requests from the frontend application. 
The configuration is implemented in the `_shared/cors.ts` file and applied to all responses in both functions.

## Required Environment Variables

For the Edge Functions to work properly, the following environment variables must be set in the Supabase dashboard or CLI:

```
SMTP_HOSTNAME=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
WEBSITE_URL=https://your-production-domain.com

COMPANY_NAME=Your Company Name
COMPANY_PHONE=+123456789
COMPANY_EMAIL=contact@yourdomain.com
```

## Deploying the Edge Functions

To deploy the Edge Functions using the Supabase CLI:

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Login to Supabase:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-ref
   ```

4. Deploy the Edge Functions:
   ```
   supabase functions deploy send-lead-notification --no-verify-jwt
   supabase functions deploy send-lead-auto-response --no-verify-jwt
   ```

5. Set the required environment variables:
   ```
   supabase secrets set SMTP_HOSTNAME=your-smtp-server.com
   supabase secrets set SMTP_PORT=587
   supabase secrets set SMTP_USERNAME=your-smtp-username
   supabase secrets set SMTP_PASSWORD=your-smtp-password
   supabase secrets set SMTP_FROM=noreply@yourdomain.com
   supabase secrets set WEBSITE_URL=https://your-production-domain.com
   supabase secrets set COMPANY_NAME="Your Company Name"
   supabase secrets set COMPANY_PHONE="+123456789"
   supabase secrets set COMPANY_EMAIL=contact@yourdomain.com
   ```

## Local Development

For local development and testing, you can run the Edge Functions locally:

1. Start the local Supabase instance:
   ```
   supabase start
   ```

2. Set local environment variables in .env.local file in the supabase directory

3. Run the functions locally:
   ```
   supabase functions serve --no-verify-jwt --env-file ./supabase/.env
   ```

4. Test the functions with a tool like curl:
   ```
   curl -X POST http://localhost:54321/functions/v1/send-lead-notification \
     -H "Content-Type: application/json" \
     -d '{"leadId":"123","to":"test@example.com","leadName":"Test User","leadEmail":"test@example.com","leadPhone":"123456789","leadMessage":"Test message","propertyTitle":"Test Property","source":"website"}'
   ```

## Troubleshooting CORS Issues

If you continue experiencing CORS issues:

1. Check that the response headers include the correct CORS headers
2. Verify that OPTIONS requests are handled correctly
3. Check browser console for specific CORS error messages
4. Test the functions directly using tools like curl or Postman
5. Ensure your Supabase project has the correct permissions configured

For development purposes only, you can install a CORS browser extension to bypass CORS restrictions temporarily.

## Fallback Mode

The current implementation includes a fallback mechanism in the frontend code to handle cases where the Edge Functions are not available or return errors. This ensures that the core functionality of lead creation continues to work even if the email notification system fails.
