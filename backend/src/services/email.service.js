/**
 * Serviço de e-mail — MOCK para fins acadêmicos.
 * Em produção, substituir por Nodemailer + SMTP ou serviço como SendGrid.
 */
class EmailService {
  /**
   * Simula o envio de e-mail de boas-vindas após cadastro.
   */
  async sendWelcome(toEmail, userName) {
    console.log(`[EMAIL MOCK] Boas-vindas enviado para ${toEmail} (usuário: ${userName})`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  /**
   * Simula o envio de confirmação de pedido.
   */
  async sendOrderConfirmation(toEmail, orderId, total) {
    console.log(`[EMAIL MOCK] Confirmação do pedido #${orderId} (R$ ${total}) enviada para ${toEmail}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

module.exports = new EmailService();
