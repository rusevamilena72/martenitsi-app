import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailRequest {
  customerEmail: string;
  customerDetails: string;
  orderDetails: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { customerEmail, customerDetails, orderDetails }: OrderEmailRequest = await req.json();

    if (!customerEmail || !orderDetails) {
      return new Response(
        JSON.stringify({ error: "Customer email and order details are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailContent = `
Нова поръчка от мартеници!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Имейл на купувача:
${customerEmail}

Допълнителни данни на купувача:
${customerDetails || 'Не са предоставени'}

Детайли на поръчката:
${orderDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Дата: ${new Date().toLocaleString('bg-BG', { timeZone: 'Europe/Sofia' })}
    `.trim();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Мартеници <onboarding@resend.dev>",
        to: ["rusevamilena72@gmail.com"],
        subject: "Нова поръчка от мартеници",
        text: emailContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendData = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
