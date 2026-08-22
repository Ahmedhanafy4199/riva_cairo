/**
 * Notification Service for Riva Cairo Store
 * 100% Free Email notification integration
 */

// Default Owner Info (Can be overridden by .env variables)
const DEFAULT_OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "ahmedhanafy289@gmail.com";
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "";
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

/**
 * Format order summary message for notifications
 */
export const formatOrderMessage = (order, cartItems = []) => {
  const orderId = order.id || "N/A";
  const customerName = order.customerName || order.customer_name || "عميل بدون اسم";
  const phone = order.phone || "بدون رقم";
  const address = order.address || "";
  const city = order.city || "";
  const paymentMethod = order.paymentMethod || order.payment_method || "الدفع عند الاستلام";
  const totalAmount = typeof order.totalAmount === 'number' 
    ? order.totalAmount.toFixed(2) 
    : typeof order.total_amount === 'number' 
      ? order.total_amount.toFixed(2) 
      : order.totalAmount || order.total_amount || "0.00";

  const items = (cartItems && cartItems.length > 0) 
    ? cartItems 
    : (order.items || order.order_items || []);

  const itemsListStr = items
    .map((item, i) => `   ${i + 1}. ${item.title} (الكمية: ${item.quantity || 1} | السعر: ${item.price})`)
    .join("\n");

  return `🎉 طلب جديد في RIVA CAIRO!
------------------------------
رقم الطلب: ${orderId}
الاسم: ${customerName}
رقم الهاتف: ${phone}
العنوان: ${address} - ${city}
طريقة الدفع: ${paymentMethod}
إجمالي المبلغ: ${totalAmount} ج.م

المنتجات المطلوبة:
${itemsListStr}
------------------------------
تاريخ الطلب: ${new Date().toLocaleString('ar-EG')}`;
};

/**
 * Send Email notification via free EmailJS or Web3Forms or direct webhook
 */
export const sendEmailNotification = async (order, orderMessage) => {
  const targetEmail = DEFAULT_OWNER_EMAIL;

  // 1. Try EmailJS if configured
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: targetEmail,
            order_id: order.id,
            customer_name: order.customerName || order.customer_name,
            customer_phone: order.phone,
            customer_address: `${order.address}, ${order.city}`,
            total_amount: order.totalAmount || order.total_amount,
            message: orderMessage,
          },
        }),
      });

      if (response.ok) {
        console.log("✅ Email notification sent successfully via EmailJS.");
        return true;
      }
    } catch (err) {
      console.warn("⚠️ EmailJS dispatch failed:", err);
    }
  }

  // 2. Try Web3Forms if access key exists
  if (WEB3FORMS_ACCESS_KEY) {
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `🛒 طلب جديد #${order.id} - RIVA CAIRO`,
          from_name: "Riva Cairo Store",
          to_email: targetEmail,
          message: orderMessage,
        }),
      });

      if (response.ok) {
        console.log("✅ Email notification sent successfully via Web3Forms.");
        return true;
      }
    } catch (err) {
      console.warn("⚠️ Web3Forms dispatch failed:", err);
    }
  }

  // 3. Fallback: FormSubmit (100% Free - No API key required)
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: `🎉 طلب جديد في RIVA CAIRO! (#${order.id || 'N/A'})`,
        _template: "table",
        customer_name: order.customerName || order.customer_name || "عميل",
        customer_phone: order.phone || "",
        customer_address: `${order.address || ''}, ${order.city || ''}`,
        order_details: orderMessage
      }),
    });

    if (response.ok) {
      console.log("✅ Email notification sent successfully via FormSubmit.");
      return true;
    }
  } catch (err) {
    console.warn("⚠️ FormSubmit dispatch failed:", err);
  }

  console.log("ℹ️ Order notifications processed.");
  return false;
};

/**
 * Trigger Email notification for new order
 */
export const notifyOwnerOfNewOrder = async (order, cartItems = []) => {
  try {
    const orderMessage = formatOrderMessage(order, cartItems);
    
    // Trigger Email notification in background
    sendEmailNotification(order, orderMessage);

    return {
      orderMessage,
    };
  } catch (err) {
    console.error("Failed to notify store owner:", err);
    return null;
  }
};
