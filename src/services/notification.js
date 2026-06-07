/**
 * Notification Service
 * Handles sending E-mails (via EmailJS REST API) and Telegram Bot notifications.
 */

// Helper to send Telegram notifications
export const sendTelegramNotification = async (message) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram notification skipped: VITE_TELEGRAM_BOT_TOKEN or VITE_TELEGRAM_CHAT_ID is missing in .env");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Telegram API Error:", errData);
      return false;
    }

    console.log("Telegram notification sent successfully.");
    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
};

// Helper to send E-mail notifications (via EmailJS REST API)
export const sendEmailNotification = async (templateParams) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("Email notification skipped: EmailJS VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY is missing in .env");
    return false;
  }

  try {
    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("EmailJS API Error:", errText);
      return false;
    }

    console.log("Email notification sent successfully.");
    return true;
  } catch (error) {
    console.error("Failed to send Email notification:", error);
    return false;
  }
};
