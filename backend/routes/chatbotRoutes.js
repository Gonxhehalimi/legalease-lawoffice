const express = require("express");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db/connection");
const { validateChatbotMessage } = require("../middleware/validators");

const router = express.Router();

// A bit more generous than form submissions, since a real chat conversation
// involves several messages back to back — 40 per 15 min per IP.
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please slow down." }
});

/** Short disclaimer required for legal-related answers (English). */
const DISCLAIMER_EN =
  "This is general information only and does not replace legal advice from a licensed lawyer.";

/** Same disclaimer (Albanian). */
const DISCLAIMER_SQ =
  "Ky është vetëm informacion i përgjithshëm dhe nuk zëvendëson këshillën ligjore të një avokati të licencuar.";

function withDisclaimer(body, isSq) {
  const d = isSq ? DISCLAIMER_SQ : DISCLAIMER_EN;
  return `${body}\n\n${d}`;
}

/**
 * Simple keyword routing — EN + SQ. Order: specific topics before generic "services".
 */
function ruleBasedReply(text, lang) {
  const isSq = lang === "sq";
  const t = String(text || "").toLowerCase();

  const officeAddress =
    "Rruga Marie Shllaku, Gjilan 60000";
  const officePhone = "(383) 45-300-791";
  const officeEmail = "halimieremira@gmail.com";
  const officeHoursEn = "Monday to Friday, 8:00 AM – 4:00 PM";
  const officeHoursSq = "nga e Hëna deri të Premte, 8:00 – 16:00";

  // --- Greetings ---
  if (
    /^(hi|hello|hey|yo|sup)\b/.test(t) ||
    /\b(good morning|good afternoon|good evening)\b/.test(t) ||
    /pershendetje|pershëndetje|përshëndetje|tungjatjeta|\btung\b|mirëdita|miredita|si je|si jeni/.test(t)
  ) {
    const msg = isSq
      ? `Përshëndetje! Jam asistenti virtual i LegalEaseAI. Mund t'ju ndihmoj me informacion të përgjithshëm për zyrën, orarin, kontaktin dhe si të rezervoni konsultim.`
      : `Hello! I'm the LegalEaseAI virtual assistant. I can share general information about our office, hours, contact details, and how to book a consultation.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Location / where is the office ---
  if (
    /\b(where|location|address|map|gjilan|gilan|marie|shllaku|find you office)\b/.test(t) ||
    /ku është|ku eshte|adresa|vendndodhje|lokacion/.test(t)
  ) {
    const msg = isSq
      ? `Zyra ndodhet në: ${officeAddress}. Harta dhe detaje të tjera janë në faqen Contact.`
      : `Our office is located at: ${officeAddress}. You can find the map and more details on the Contact page.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Office hours ---
  if (
    /\b(hours|open|closed|schedule|when.*open|office hours)\b/.test(t) ||
    /orar|ora e punës|kur.*hapet| hapët e hënë/.test(t)
  ) {
    const msg = isSq
      ? `Orari i zyrës për informacion të përgjithshëm: ${officeHoursSq}.`
      : `General office hours information: ${officeHoursEn}.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Contact (phone, email) ---
  if (
    /\b(contact|phone|call|email|reach|number)\b/.test(t) ||
    /kontakt|telefon|thirr|email|numër|numer/.test(t)
  ) {
    const msg = isSq
      ? `Mund të na kontaktoni: 📞 ${officePhone}, ✉️ ${officeEmail}. Formularët janë në faqen Contact.`
      : `You can reach us at: 📞 ${officePhone}, ✉️ ${officeEmail}. Forms are available on the Contact page.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Pricing / fees ---
  if (
    /\b(price|pricing|fee|fees|cost|how much|payment|rate)\b/.test(t) ||
    /çmim|cmim|tarif|pagesë|pagese|sa kushton/.test(t)
  ) {
    const msg = isSq
      ? `Tarifat dhe struktura e pagesës varen nga lloji i çështjes. Zakonisht diskutohen gjatë një konsultimi fillestar. Ju lutemi përdorni formularin e konsultimit në faqen Contact që të organizojmë një bisedë.`
      : `Fees depend on the type of matter and are usually discussed during an initial consultation. Please use the consultation form on the Contact page so we can arrange a conversation.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Family law ---
  if (
    /\b(family law|divorce|custody|alimony|marriage|child support)\b/.test(t) ||
    /familje|divorc|kujdestari|ushtrim|martesë|martese/.test(t)
  ) {
    const msg = isSq
      ? `Zyra mund të mbështesë në çështje të së drejtës së familjes (sipas natyrës së rastit). Hapat dhe dokumentet ndryshojnë për çdo situatë.`
      : `The office may assist with family-law matters depending on your situation. Steps and documents vary case by case.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Property / real estate ---
  if (
    /\b(property|real estate|landlord|tenant|deed|ownership)\b/.test(t) ||
    /pronë|prone|pasuri|tokë|toke|paluajtshme|blerje shpi/.test(t)
  ) {
    const msg = isSq
      ? `Çështjet e pronësisë dhe pasurive mund të përfshijnë kontrata, hipoteka dhe procedura para institucioneve. Detajet varen nga rasti juaj.`
      : `Property and real-estate matters may involve contracts, registers, and institutional procedures—details depend on your case.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Business / corporate ---
  if (
    /\b(business law|company|corporate|contract|startup|llc|registration)\b/.test(t) ||
    /biznes|kompani|korporativ|themelim|ndërmarrje|ndermarje|kontratë biznesi/.test(t)
  ) {
    const msg = isSq
      ? `Për çështje biznesi (kontrata, themelim, obligime) zakonisht nevojitet përshkrim i situatës dhe dokumentacion përkatës.`
      : `Business matters often need a clear description of your situation and supporting documents.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Documents needed ---
  if (
    /\b(document|documents|paperwork|papers|bring|prepare|id card|passport)\b/.test(t) ||
    /dokument|letër|leteër|çfarë.*duhet|cfare.*duhet|paraqes/.test(t)
  ) {
    const msg = isSq
      ? `Dokumentet e nevojshme varen nga lloji i çështjes (identifikim, kontrata, certifikata, etj.). Lista e saktë jepet gjatë konsultimit pas përshkrimit të rastit.`
      : `Required documents depend on your matter (ID, contracts, certificates, etc.). A precise list is provided during a consultation after you describe your case.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Book consultation ---
  if (
    /\b(book|booking|consult|consultation|appointment|meet|schedule)\b/.test(t) ||
    /rezerv|takim|konsultim|si të rezervoj/.test(t)
  ) {
    const msg = isSq
      ? `Për të rezervuar konsultim, hapni faqen Contact, plotësoni formularin e konsultimit dhe ne do t'ju kontaktojmë.`
      : `To book a consultation, open the Contact page, complete the consultation request form, and we will follow up with you.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Legal services (general) ---
  if (
    /\b(service|services|practice|legal help|what do you do)\b/.test(t) ||
    /shërbim|sherbim|çfarë ofroni|cfare ofroni|çështje ligjore/.test(t)
  ) {
    const msg = isSq
      ? `Zyra ofron mbështetje ligjore në disa fusha (p.sh. civile, penale, administrative, familjare). Për përshkrim më të plotë, shihni faqen Services ose rezervoni konsultim.`
      : `The office provides legal support in several areas (for example civil, criminal, administrative, family). See the Services page or book a consultation for more detail.`;
    return withDisclaimer(msg, isSq);
  }

  // --- Disclaimer-only question ---
  if (/\b(disclaimer|legal advice|not a lawyer)\b/.test(t)) {
    return withDisclaimer(
      isSq
        ? `Po, ky chatbot jep vetëm informacion të përgjithshëm.`
        : `Yes—this chatbot only provides general information.`,
      isSq
    );
  }

  // --- Fallback: guide to consultation ---
  const fallback = isSq
    ? `Nuk kam një përgjigje të përshkruar për këtë pyetje këtu. Për çështje personale ose të ndërlikuara me ligjin, ju lutemi rezervoni një konsultim përmes faqes Contact që të flisni drejtpërdrejt me zyrën.`
    : `I don't have a specific answer for that here. For personal or legal matters, please book a consultation through the Contact page to speak directly with the office.`;
  return withDisclaimer(fallback, isSq);
}

// POST /api/chatbot  (public)
router.post("/", chatLimiter, validateChatbotMessage, async (req, res) => {
  try {
    const userMessage = String(req.body.user_message).trim();
    const language = req.body.language === "sq" ? "sq" : "en";

    const botResponse = ruleBasedReply(userMessage, language);

    await pool.execute(
      `INSERT INTO chatbot_messages (user_message, bot_response, language)
       VALUES (?, ?, ?)`,
      [userMessage, botResponse, language]
    );

    res.json({ bot_response: botResponse, language });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chatbot save failed (check MySQL)." });
  }
});

module.exports = router;
