import { Order, ContactSettings } from '../src/types.js';

/**
 * Cleans phone number to international format digits only (e.g. 919876543210)
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/**
 * Builds the structured WhatsApp order message matching the exact specification:
 * 
 * Hello 87 Pincode,
 * 
 * I would like to place an order.
 * 
 * Order ID: #87PC-1024
 * 
 * Customer:
 * Name: Rahul
 * Phone: +91XXXXXXXXXX
 * Email: customer@example.com
 * 
 * Products:
 * 1. Product Name
 *    Size: M
 *    Color: Black
 *    Quantity: 2
 *    Price: ₹999
 * ...
 * Subtotal: ₹3,497
 * Shipping: ₹0
 * Total: ₹3,497
 * 
 * Delivery Address:
 * [Customer Address]
 * 
 * Please confirm this order.
 * 
 * Thank you,
 * 87 Pincode
 */
export function generateWhatsAppOrderMessage(order: Order, storeName = '87 Pincode'): string {
  const currency = '₹';
  const productsList = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.product_name}\n   Size: ${item.size}\n   Color: ${item.color}\n   Quantity: ${item.quantity}\n   Price: ${currency}${item.unit_price.toLocaleString('en-IN')}`
    )
    .join('\n\n');

  const address = order.delivery_address;
  const addressText = `${address.full_name}, ${address.phone}\n${address.street}${address.landmark ? ', Near ' + address.landmark : ''}\n${address.city}, ${address.state} - ${address.pincode}${address.notes ? '\nNotes: ' + address.notes : ''}`;

  return `Hello ${storeName},

I would like to place an order.

Order ID: #${order.id}

Customer:
Name: ${order.customer_name}
Phone: ${order.customer_phone}
Email: ${order.customer_email}

Products:

${productsList}

Subtotal: ${currency}${order.subtotal.toLocaleString('en-IN')}
Shipping: ${currency}${order.shipping.toLocaleString('en-IN')}
${order.discount > 0 ? `Discount: -${currency}${order.discount.toLocaleString('en-IN')}\n` : ''}Total: ${currency}${order.total.toLocaleString('en-IN')}

Delivery Address:
${addressText}

Please confirm this order.

Thank you,
${storeName}`;
}

/**
 * Builds the structured WhatsApp cancellation message matching the exact specification:
 * 
 * Hello 87 Pincode,
 * 
 * I would like to request cancellation of my order.
 * 
 * Order ID: #87PC-1024
 * 
 * Customer: Rahul
 * Order Total: ₹3,497
 * 
 * Reason:
 * [Reason if provided]
 * 
 * Please review my cancellation request.
 */
export function generateWhatsAppCancellationMessage(order: Order, reason = 'Customer requested cancellation', storeName = '87 Pincode'): string {
  const currency = '₹';
  return `Hello ${storeName},

I would like to request cancellation of my order.

Order ID: #${order.id}

Customer: ${order.customer_name}
Order Total: ${currency}${order.total.toLocaleString('en-IN')}

Reason:
${reason.trim() || 'No specific reason provided'}

Please review my cancellation request.`;
}

/**
 * Builds the complete wa.me link with encoded text message
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
