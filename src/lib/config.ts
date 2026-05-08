// ── WhatsApp ──────────────────────────────────────────────────────────────────
// Replace with the actual WhatsApp number (international format, no + or spaces)
export const WHATSAPP_NUMBER = "254757541073";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_GREETING =
  "Hi, I'm interested in booking a villa at Firstrose, Mwabungo Diani. Could you help me with availability and pricing?";
