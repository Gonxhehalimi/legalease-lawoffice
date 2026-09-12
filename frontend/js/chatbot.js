// AI FAQ Chatbot
class LegalChatbot {
  constructor() {
    this.isOpen = false;
    this.chatHistory = [];
    this.introShown = false;
    // API_BASE_URL comes from js/config.js, loaded before this file.
    this.apiBaseUrl = API_BASE_URL;
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.setupEventListeners();
    // Welcome message will be shown when user sends their first message
  }

  createChatbotUI() {
    const chatbotHTML = `
      <div id="chatbotContainer" class="chatbot-container">
        <div id="chatbotHeader" class="chatbot-header">
          <h3 data-translate-chatbot="title">AI Legal Assistant</h3>
          <button id="chatbotClose" class="chatbot-close" aria-label="Close chatbot">×</button>
        </div>
        <div id="chatbotMessages" class="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input 
            type="text" 
            id="chatbotInput" 
            class="chatbot-input" 
            data-translate-placeholder="placeholder"
            placeholder="Ask me a question..."
            aria-label="Chatbot input"
          />
          <button id="chatbotSend" class="chatbot-send" data-translate-chatbot="send">Send</button>
        </div>
        <div class="chatbot-disclaimer" data-translate-chatbot="disclaimer">
          Note: This chatbot provides general information only and does not constitute legal advice. Please consult with an attorney for specific legal matters.
        </div>
      </div>
      <button id="chatbotToggle" class="chatbot-toggle" aria-label="Open chatbot">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  setupEventListeners() {
    const toggle = document.getElementById('chatbotToggle');
    const close = document.getElementById('chatbotClose');
    const send = document.getElementById('chatbotSend');
    const input = document.getElementById('chatbotInput');

    toggle?.addEventListener('click', () => this.toggleChatbot());
    close?.addEventListener('click', () => this.toggleChatbot());
    send?.addEventListener('click', () => this.handleSendMessage());
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });
  }

  toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    if (!container) return;

    this.isOpen = !this.isOpen;
    container.classList.toggle('chatbot-open', this.isOpen);
    
    if (this.isOpen) {
      document.getElementById('chatbotInput')?.focus();
    }
  }

  addWelcomeMessage() {
    const welcomeText = t('chatbot.welcome');
    this.addMessage(welcomeText, 'bot');
  }

  updateLanguage() {
    // Update chatbot UI text
    const title = document.querySelector('#chatbotHeader h3');
    if (title) title.textContent = t('chatbot.title');
    
    const placeholder = document.getElementById('chatbotInput');
    if (placeholder) placeholder.placeholder = t('chatbot.placeholder');
    
    const sendBtn = document.getElementById('chatbotSend');
    if (sendBtn) sendBtn.textContent = t('chatbot.send');
    
    const disclaimer = document.querySelector('.chatbot-disclaimer');
    if (disclaimer) disclaimer.textContent = t('chatbot.disclaimer');
  }

  addMessage(text, sender = 'user') {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message chatbot-message-${sender}`;
    // Replace newlines with <br> tags for proper formatting
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.chatHistory.push({ text, sender });
  }

  async handleSendMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Get response
    const response = await this.getResponse(message);
    
    // Remove typing indicator and show response
    this.hideTypingIndicator();
    this.addMessage(response, 'bot');
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-message chatbot-message-bot chatbot-typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  async getResponse(message) {
    const lang = currentLanguage === "sq" ? "sq" : "en";

    if (!this.introShown) {
      this.introShown = true;
      return t("chatbot.welcome");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_message: message,
          language: lang
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Chatbot request failed.");
      }

      if (data.bot_response) {
        return data.bot_response;
      }
      return this.getOfflineFallback(message, lang);
    } catch (error) {
      return this.getOfflineFallback(message, lang);
    }
  }

  getOfflineFallback(message, lang) {
    const lowerMessage = message.toLowerCase();
    const responses = this.getResponses(lang);

    for (const [keywords, response] of Object.entries(responses)) {
      if (keywords.split('|').some(keyword => lowerMessage.includes(keyword))) {
        return response;
      }
    }

    if (lang === "sq") {
      return "Serveri i chatbot-it nuk eshte i disponueshem tani. Ky chatbot jep vetem informacion te pergjithshem dhe jo keshille ligjore. Ju lutem kontaktoni zyren per ndihme specifike.";
    }
    return "The chatbot server is currently unavailable. This chatbot provides general information only and not legal advice. Please contact the office for specific help.";
  }

  getResponses(lang) {
    if (lang === 'sq') {
      return {
        'shërbim|shërbime|services': 'Ne ofrojmë shërbime në fusha të ndryshme të ligjit: E Drejta e Familjes, E Drejta Korporative, E Drejta e Imigracionit, Mbrojtja Penale, E Drejta e Pasurive të Paluajtshme, dhe E Drejta e Kontratave. Për më shumë informacion, ju lutemi vizitoni faqen e shërbimeve.',
        'orar|orë|kohë|hours|time': 'Zyra jonë është e hapur nga e Hëna deri të Premte, nga ora 9:00 deri në 17:00. Për konsultime, ju lutemi rezervoni një takim.',
        'kontakt|adresë|telefon|email|contact|address|phone': 'Mund të na kontaktoni në: 📍 Rruga Marie Shllaku, Gjilan 60000, 📞 (383) 45-300-791, ✉️ halimieremira@gmail.com',
        'konsultim|rezervim|booking|consultation|appointment': 'Për të rezervuar një konsultim, ju lutemi plotësoni formularin në faqen e kontaktit ose na telefononi direkt.',
        'çmim|kosto|pagesë|price|cost|fee': 'Çmimet variojnë në varësi të natyrës së çështjes ligjore. Për informacion më të detajuar për tarifat, ju lutemi na kontaktoni për një konsultim fillestar.',
        'divorç|divorce': 'Ne ofrojmë shërbime për procedurat e divorcit, duke përfshirë ndarjen e pasurisë, kujdestarinë e fëmijëve dhe mbështetjen për fëmijë. Për këshilla specifike, ju lutemi rezervoni një konsultim.',
        'vizë|imigracion|visa|immigration': 'Ne ndihmojmë me aplikimet e vizave, rezidencën, shtetësinë dhe ribashkimin familjar. Për më shumë informacion, ju lutemi na kontaktoni.'
      };
    } else {
      return {
        'service|services': 'We offer services in various areas of law: Family Law, Corporate Law, Immigration Law, Criminal Defense, Real Estate Law, and Contract Law. For more information, please visit our services page.',
        'hours|time|schedule': 'Our office is open Monday through Friday, from 9:00 AM to 5:00 PM. For consultations, please book an appointment.',
        'contact|address|phone|email': 'You can reach us at: 📍 Rruga Marie Shllaku, Gjilan 60000, 📞 (383) 45-300-791, ✉️ halimieremira@gmail.com',
        'consultation|booking|appointment': 'To book a consultation, please fill out the form on our contact page or call us directly.',
        'price|cost|fee': 'Pricing varies depending on the nature of the legal matter. For detailed information about our fees, please contact us for an initial consultation.',
        'divorce': 'We provide services for divorce proceedings, including property division, child custody, and child support. For specific advice, please book a consultation.',
        'visa|immigration': 'We assist with visa applications, residency, citizenship, and family reunification. For more information, please contact us.'
      };
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.legalChatbot = new LegalChatbot();
});
