// Language management system
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to set language
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  updatePageContent();
  updateLanguageSwitcher();
}

// Function to get translation
function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Function to update page content
function updatePageContent() {
  // Update navigation
  document.querySelectorAll('[data-translate-nav]').forEach(el => {
    const key = el.getAttribute('data-translate-nav');
    el.textContent = t(`nav.${key}`);
  });

  // Update home page
  document.querySelectorAll('[data-translate-home]').forEach(el => {
    const key = el.getAttribute('data-translate-home');
    el.textContent = t(`home.${key}`);
  });

  // Update about page
  document.querySelectorAll('[data-translate-about]').forEach(el => {
    const key = el.getAttribute('data-translate-about');
    const text = t(`about.${key}`);
    // Handle paragraph breaks for sectionText
    if (key === 'sectionText' && text.includes('\n\n')) {
      el.innerHTML = text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
    } else {
      el.textContent = text;
    }
  });

  // Update services page
  document.querySelectorAll('[data-translate-services]').forEach(el => {
    const key = el.getAttribute('data-translate-services');
    el.textContent = t(`services.${key}`);
  });

  // Update contact page
  document.querySelectorAll('[data-translate-contact]').forEach(el => {
    const key = el.getAttribute('data-translate-contact');
    el.textContent = t(`contact.${key}`);
  });

  // Update header
  document.querySelectorAll('[data-translate-header]').forEach(el => {
    const key = el.getAttribute('data-translate-header');
    el.textContent = t(`header.${key}`);
  });

  // Update footer
  document.querySelectorAll('[data-translate-footer]').forEach(el => {
    const key = el.getAttribute('data-translate-footer');
    el.textContent = t(`footer.${key}`);
  });

  // Update chatbot
  document.querySelectorAll('[data-translate-chatbot]').forEach(el => {
    const key = el.getAttribute('data-translate-chatbot');
    el.textContent = t(`chatbot.${key}`);
  });

  // Update placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
    const key = el.getAttribute('data-translate-placeholder');
    el.placeholder = t(`chatbot.${key}`);
  });

  // Update select options
  document.querySelectorAll('select option[data-translate-contact]').forEach(el => {
    const key = el.getAttribute('data-translate-contact');
    el.textContent = t(`contact.${key}`);
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
  
  // Update body data-lang attribute for testimonial filtering
  document.body.setAttribute('data-lang', currentLanguage);

  // Update chatbot if it exists
  if (window.legalChatbot) {
    window.legalChatbot.updateLanguage();
  }
}

// Function to update language switcher
function updateLanguageSwitcher() {
  const switcher = document.getElementById('languageSwitcher');
  if (switcher) {
    switcher.value = currentLanguage;
  }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set initial data-lang attribute
  document.body.setAttribute('data-lang', currentLanguage);
  updatePageContent();
  updateLanguageSwitcher();
});

