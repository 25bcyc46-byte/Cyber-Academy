/* =============================================
   CyberAcademy — script.js
   Interactive functionality for all sections
   No backend — all state managed in JS
============================================= */

// =============================================
// NAVIGATION — Scroll effects & mobile menu
// =============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

// Add scrolled class to navbar on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile hamburger toggle
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// =============================================
// AUTH MODAL
// =============================================
function openModal(type) {
  document.getElementById('modalOverlay').classList.remove('hidden');
  switchModal(type);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function switchModal(type) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginBtn = document.getElementById('loginTabBtn');
  const signupBtn = document.getElementById('signupTabBtn');

  if (type === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupBtn.classList.add('active');
    loginBtn.classList.remove('active');
  }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// =============================================
// QUIZ — Interactive quiz with scoring
// =============================================
const quizData = [
  {
    question: "What does 'CIA' stand for in cybersecurity?",
    options: [
      "Central Intelligence Agency",
      "Confidentiality, Integrity, Availability",
      "Cyber Intrusion Alert",
      "Configuration, Isolation, Access"
    ],
    correct: 1,
    explanation: "Correct! The CIA Triad is the foundational model for information security, representing Confidentiality (only authorized access), Integrity (data accuracy), and Availability (data accessible when needed)."
  },
  {
    question: "Which type of attack tricks users into revealing sensitive information by impersonating a trusted entity?",
    options: [
      "SQL Injection",
      "Denial of Service (DoS)",
      "Phishing",
      "Buffer Overflow"
    ],
    correct: 2,
    explanation: "Correct! Phishing is a social engineering attack where attackers impersonate trusted entities via email, SMS, or fake websites to steal credentials, financial info, or install malware."
  },
  {
    question: "What is the primary purpose of Multi-Factor Authentication (MFA)?",
    options: [
      "To encrypt data at rest",
      "To speed up the login process",
      "To add additional verification layers beyond a password",
      "To monitor user activity"
    ],
    correct: 2,
    explanation: "Correct! MFA requires users to provide 2+ verification factors (something you know, have, or are), significantly reducing the risk of unauthorized access even if a password is compromised."
  },
  {
    question: "Which OWASP Top 10 vulnerability occurs when untrusted data is sent to an interpreter as part of a command?",
    options: [
      "Broken Access Control",
      "Injection",
      "Security Misconfiguration",
      "Insecure Design"
    ],
    correct: 1,
    explanation: "Correct! Injection attacks (SQL, NoSQL, OS, LDAP) occur when untrusted data is sent to an interpreter. Attackers can manipulate queries to read/modify databases or execute commands."
  },
  {
    question: "What does the '3-2-1 backup rule' refer to?",
    options: [
      "3 passwords, 2 emails, 1 recovery code",
      "Backup every 3 days, 2 weeks, and 1 month",
      "3 copies of data, 2 different media types, 1 offsite",
      "3 encryption keys, 2 factors, 1 admin"
    ],
    correct: 2,
    explanation: "Correct! The 3-2-1 rule: keep 3 copies of your data, store them on 2 different media types, and keep 1 offsite. This protects against hardware failure, ransomware, and natural disasters."
  }
];

let currentQuestion = 0;
let quizScore = 0;
let quizAnswered = false;

// Render a question
function renderQuestion() {
  const q = quizData[currentQuestion];
  document.getElementById('quizQuestion').textContent = q.question;
  document.getElementById('qCurrent').textContent = currentQuestion + 1;
  document.getElementById('qTotal').textContent = quizData.length;
  document.getElementById('quizScore').textContent = quizScore;
  document.getElementById('quizProgressFill').style.width =
    ((currentQuestion) / quizData.length * 100) + '%';

  const optionsEl = document.getElementById('quizOptions');
  optionsEl.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => answerQuiz(btn, idx === q.correct);
    optionsEl.appendChild(btn);
  });

  document.getElementById('quizFeedback').className = 'quiz-feedback hidden';
  document.getElementById('quizNext').classList.add('hidden');
  quizAnswered = false;
}

// Handle answer selection
function answerQuiz(btn, isCorrect) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = quizData[currentQuestion];
  const allBtns = document.querySelectorAll('.quiz-opt');
  
  // Disable all buttons and mark correct/incorrect
  allBtns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.correct) {
      b.classList.add('correct');
    } else if (b === btn && !isCorrect) {
      b.classList.add('incorrect');
    }
  });

  const feedbackEl = document.getElementById('quizFeedback');
  feedbackEl.classList.remove('hidden');

  if (isCorrect) {
    quizScore += 20;
    document.getElementById('quizScore').textContent = quizScore;
    feedbackEl.className = 'quiz-feedback success';
    feedbackEl.innerHTML = `✅ <strong>Well done!</strong> ${q.explanation}`;
  } else {
    feedbackEl.className = 'quiz-feedback error';
    feedbackEl.innerHTML = `❌ <strong>Not quite.</strong> ${q.explanation}`;
  }

  // Send answer to API if available
  if (typeof window.onQuizAnswered === 'function') {
    window.onQuizAnswered(isCorrect);
  }

  // Show next button
  const nextBtn = document.getElementById('quizNext');
  nextBtn.classList.remove('hidden');
  nextBtn.textContent = currentQuestion < quizData.length - 1 ? 'Next Question →' : 'See Results';
}

// Move to next question or show results
function nextQuestion() {
  currentQuestion++;

  if (currentQuestion >= quizData.length) {
    // Show final results
    const container = document.getElementById('quizContainer');
    const pct = Math.round((quizScore / (quizData.length * 20)) * 100);
    const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good effort!' : '📚 Keep studying!';
    
    container.innerHTML = `
      <div style="text-align:center;padding:2rem">
        <div style="font-size:3rem;margin-bottom:1rem">${grade.split(' ')[0]}</div>
        <h3 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:0.5rem">Quiz Complete!</h3>
        <p style="color:var(--text-dim);margin-bottom:1.5rem">Final Score: <span style="color:var(--green-accent);font-family:var(--font-mono);font-size:1.3rem">${quizScore}/${quizData.length * 20}</span> — ${pct}%</p>
        <p style="color:var(--text-secondary);margin-bottom:2rem">${grade.split(' ').slice(1).join(' ')}</p>
        <button class="btn-primary" onclick="restartQuiz()">Try Again →</button>
      </div>`;
    return;
  }

  renderQuestion();
}

function restartQuiz() {
  currentQuestion = 0;
  quizScore = 0;
  document.getElementById('quizContainer').innerHTML = `
    <div class="quiz-progress-bar">
      <div class="quiz-progress-fill" id="quizProgressFill" style="width: 0%"></div>
    </div>
    <div class="quiz-meta mono">
      <span>Question <span id="qCurrent">1</span> of <span id="qTotal">5</span></span>
      <span>Score: <span id="quizScore">0</span> pts</span>
    </div>
    <div id="quizQuestion" class="quiz-question"></div>
    <div id="quizOptions" class="quiz-options"></div>
    <div id="quizFeedback" class="quiz-feedback hidden"></div>
    <button id="quizNext" class="btn-primary hidden" onclick="nextQuestion()">Next Question →</button>`;
  renderQuestion();
}

// Initialize quiz on page load
renderQuestion();

// =============================================
// PHISHING IDENTIFICATION
// =============================================
const emailScenarios = [
  {
    from: 'security-alerts@paypa1.support.ru',
    subject: 'URGENT: Your account has been suspended!',
    body: `<p>Dear Valued Customer,</p>
      <p>We have detected <strong>suspicious activity</strong> on your account. Your account has been <span style="color:#f87171">temporarily suspended</span> for your safety.</p>
      <p>You must <strong>verify your identity immediately</strong> or your account will be permanently deleted within <strong>24 HOURS</strong>.</p>
      <p><a href="#" onclick="return false;" style="color:#60a5fa">Click here to verify → http://paypa1-secure-verify.xyz/login</a></p>
      <p>Thank you for your cooperation,<br/>PayPal Security Team</p>`,
    isPhishing: true,
    clues: "Red flags: Sender domain 'paypa1.support.ru' (not paypal.com), .ru TLD, fake urgency, suspicious link URL, grammar pressure tactics."
  },
  {
    from: 'noreply@github.com',
    subject: 'Your pull request has been merged',
    body: `<p>Hi developer,</p>
      <p>Your pull request <strong>#847: Fix authentication middleware</strong> has been reviewed and successfully merged into <code>main</code>.</p>
      <p>Repository: <strong>org/security-platform</strong></p>
      <p>You can view the merge at: <a href="#" onclick="return false;" style="color:#60a5fa">https://github.com/org/security-platform/pull/847</a></p>
      <p>Thanks for contributing!<br/>The GitHub Team</p>`,
    isPhishing: false,
    clues: "This appears legitimate: Sender is @github.com (official domain), professional tone, no urgency, specific technical details, link matches github.com domain."
  },
  {
    from: 'it-support@universit-helpdesk.com',
    subject: 'Your university account will expire - ACTION REQUIRED',
    body: `<p>Dear Student,</p>
      <p>Your <strong>university email account</strong> will expire in <strong>48 hours</strong> unless you re-validate your credentials.</p>
      <p>Please click the link below and enter your university credentials to maintain access:</p>
      <p><a href="#" onclick="return false;" style="color:#60a5fa">https://university-account-verify.weebly.com/login</a></p>
      <p>Failure to act will result in permanent account deletion and loss of all academic records.</p>
      <p>IT Support Team</p>`,
    isPhishing: true,
    clues: "Red flags: Domain 'universit-helpdesk.com' (typo), verification link goes to weebly.com (free website), extreme urgency ('academic records'), universities don't expire accounts this way."
  }
];

let currentEmailIndex = 0;
let emailAnswered = false;

function judgeEmail(verdict) {
  if (emailAnswered) return;
  emailAnswered = true;

  const scenario = emailScenarios[currentEmailIndex];
  const isCorrect = (verdict === 'phishing') === scenario.isPhishing;
  const feedbackEl = document.getElementById('phishingFeedback');
  const nextBtn = document.getElementById('nextEmailBtn');

  feedbackEl.classList.remove('hidden');

  if (isCorrect) {
    if (scenario.isPhishing) {
      feedbackEl.className = 'quiz-feedback success';
      feedbackEl.innerHTML = `✅ <strong>Correct! That was phishing.</strong><br/>${scenario.clues}`;
    } else {
      feedbackEl.className = 'quiz-feedback success';
      feedbackEl.innerHTML = `✅ <strong>Correct! That email was legitimate.</strong><br/>${scenario.clues}`;
    }
  } else {
    if (scenario.isPhishing) {
      feedbackEl.className = 'quiz-feedback error';
      feedbackEl.innerHTML = `❌ <strong>That was phishing!</strong><br/>${scenario.clues}`;
    } else {
      feedbackEl.className = 'quiz-feedback warning';
      feedbackEl.innerHTML = `⚠️ <strong>That was actually safe!</strong><br/>${scenario.clues}`;
    }
  }

  // Send answer to API if available
  if (typeof window.onPhishingAnswered === 'function') {
    window.onPhishingAnswered(isCorrect);
  }

  // Disable buttons
  document.querySelectorAll('.phish-btn').forEach(b => b.disabled = true);
  nextBtn.style.display = 'block';
}

function nextEmail() {
  currentEmailIndex = (currentEmailIndex + 1) % emailScenarios.length;
  emailAnswered = false;
  const scenario = emailScenarios[currentEmailIndex];

  document.getElementById('emailFrom').textContent = scenario.from;
  document.getElementById('emailSubject').textContent = scenario.subject;
  document.getElementById('emailBody').innerHTML = scenario.body;
  document.getElementById('phishingFeedback').className = 'quiz-feedback hidden';
  document.getElementById('nextEmailBtn').style.display = 'none';
  document.querySelectorAll('.phish-btn').forEach(b => b.disabled = false);
}

// =============================================
// CASE STUDY EXPANSION
// =============================================
function expandCase(card) {
  const expandEl = card.querySelector('.case-expand');
  const isExpanded = !expandEl.classList.contains('hidden');
  
  // Close all other expanded cards
  document.querySelectorAll('.case-expand').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.case-card').forEach(c => c.style.borderColor = '');
  
  if (!isExpanded) {
    expandEl.classList.remove('hidden');
    card.style.borderColor = 'rgba(45, 156, 219, 0.5)';
  }
}

// =============================================
// THREAT SCENARIO — Decision making game
// =============================================
const scenarios = [
  {
    icon: '🚨',
    title: 'Suspicious Login Detected',
    desc: "You're a junior security analyst. The SIEM shows a login to the CEO's account from an IP in Eastern Europe at 3AM local time. The CEO is known to travel internationally. What do you do?",
    options: [
      { text: "Do nothing, probably just the CEO traveling", result: 'wrong', feedback: "Ignoring alerts is dangerous. Even if it's a false positive, unacknowledged alerts can lead to missed breaches. Always investigate." },
      { text: "Call the CEO directly to verify", result: 'partial', feedback: "Good instinct, but calling directly might not follow IR procedures. Use out-of-band verification channels established in your IR plan." },
      { text: "Suspend the session, escalate to SOC lead, initiate IR procedures", result: 'best', feedback: "Excellent! Temporarily suspending access while escalating protects the CEO's account while the SOC investigates. This follows proper IR procedures." },
      { text: "Delete the account and force password reset immediately", result: 'wrong', feedback: "Deleting accounts doesn't follow IR procedures, destroys evidence, and causes major disruption. Suspend sessions, don't delete accounts." }
    ]
  },
  {
    icon: '📧',
    title: 'Ransomware Attachment Opened',
    desc: "An employee calls you in a panic — they clicked an email attachment and their screen shows: 'Your files have been encrypted. Pay 5 BTC to recover them.' The computer is still connected to the network. What's your first action?",
    options: [
      { text: "Tell them to pay the ransom quickly", result: 'wrong', feedback: "Never pay ransoms without consulting leadership and law enforcement. Payment doesn't guarantee data recovery and funds criminal operations." },
      { text: "Immediately disconnect from the network (unplug cable/disable WiFi)", result: 'best', feedback: "Correct first response! Isolating the infected machine prevents ransomware from spreading laterally across the network. Containment comes before everything else." },
      { text: "Restart the computer to stop the encryption", result: 'wrong', feedback: "Restarting can worsen the situation, may complete encryption, and destroys valuable forensic evidence (RAM memory). Isolate first." },
      { text: "Start scanning the machine with antivirus", result: 'partial', feedback: "While antivirus is useful, network isolation must happen first to prevent spread. Containment is the immediate priority in ransomware incidents." }
    ]
  },
  {
    icon: '🔑',
    title: 'Credential Request in Chat',
    desc: "Your manager messages you on Slack: 'Hey, I need your VPN credentials urgently for a client presentation. Can you send them now? I'm in a meeting and can't access mine.' What do you do?",
    options: [
      { text: "Send the credentials — your manager needs them urgently", result: 'wrong', feedback: "Never share your credentials with anyone, including management. This is a classic pretexting attack. Credentials are personal and non-transferable by policy." },
      { text: "Call your manager directly to verify the request is legitimate", result: 'best', feedback: "Perfect! Out-of-band verification (phone call) defeats impersonation attacks. If the Slack account was compromised, a phone call reveals the deception." },
      { text: "Ignore the message entirely", result: 'partial', feedback: "Better than sharing credentials, but you should report this suspicious request to IT security. Social engineering attempts should be documented." },
      { text: "Create a temporary account and share those credentials instead", result: 'wrong', feedback: "Creating unauthorized accounts violates security policy. Verify the requestor's identity first — this has the hallmarks of a social engineering/pretexting attack." }
    ]
  }
];

let currentScenarioIndex = 0;
let scenarioAnswered = false;

function chooseScenario(btn, result, feedback) {
  if (scenarioAnswered) return;
  scenarioAnswered = true;

  btn.classList.add(result);
  document.querySelectorAll('.scenario-btn').forEach(b => b.disabled = true);

  const feedbackEl = document.getElementById('scenarioFeedback');
  feedbackEl.classList.remove('hidden');
  
  const resultEmoji = result === 'best' ? '✅' : result === 'partial' ? '⚠️' : '❌';
  const resultClass = result === 'best' ? 'success' : result === 'partial' ? 'warning' : 'error';
  feedbackEl.className = `quiz-feedback ${resultClass}`;
  feedbackEl.innerHTML = `${resultEmoji} ${feedback}`;

  // Send answer to API if available
  if (typeof window.onScenarioAnswered === 'function') {
    window.onScenarioAnswered(result);
  }

  document.getElementById('nextScenarioBtn').classList.remove('hidden');
}

function nextScenario() {
  currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
  scenarioAnswered = false;
  const s = scenarios[currentScenarioIndex];

  document.querySelector('.scenario-icon').textContent = s.icon;
  document.getElementById('scenarioTitle').textContent = s.title;
  document.getElementById('scenarioDesc').textContent = s.desc;
  document.getElementById('scenarioTitle').style.color = 'var(--red-accent)';

  const optionsEl = document.getElementById('scenarioOptions');
  optionsEl.innerHTML = '';
  s.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'scenario-btn';
    btn.textContent = opt.text;
    btn.onclick = () => chooseScenario(btn, opt.result, opt.feedback);
    optionsEl.appendChild(btn);
  });

  document.getElementById('scenarioFeedback').className = 'quiz-feedback hidden';
  document.getElementById('nextScenarioBtn').classList.add('hidden');
}

// =============================================
// RISK ASSESSMENT CHECKLIST
// =============================================
function updateChecklist() {
  const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
  const total = checkboxes.length;
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const pct = Math.round((checked / total) * 100);

  document.getElementById('checklistFill').style.width = pct + '%';

  let message = '';
  if (checked === 0) message = `Security Score: ${checked}/${total} — Start checking items above!`;
  else if (pct < 40) message = `Security Score: ${checked}/${total} (${pct}%) — 🔴 High Risk — Address gaps immediately!`;
  else if (pct < 70) message = `Security Score: ${checked}/${total} (${pct}%) — 🟡 Moderate Risk — Significant improvements needed`;
  else if (pct < 100) message = `Security Score: ${checked}/${total} (${pct}%) — 🟢 Good Posture — Address remaining gaps`;
  else message = `Security Score: ${checked}/${total} (100%) — 🏆 Excellent! All baseline controls in place`;

  document.getElementById('checklistText').textContent = message;

  // Update fill color based on score
  const fill = document.getElementById('checklistFill');
  if (pct < 40) fill.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
  else if (pct < 70) fill.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
  else fill.style.background = 'linear-gradient(90deg, var(--blue-accent), var(--green-accent))';
}

// =============================================
// SECURE vs INSECURE TOGGLE
// =============================================
function switchPractice(mode) {
  const insecurePanel = document.getElementById('insecurePanel');
  const securePanel = document.getElementById('securePanel');
  const insecureTab = document.getElementById('insecureTab');
  const secureTab = document.getElementById('secureTab');

  if (mode === 'insecure') {
    insecurePanel.classList.remove('hidden');
    securePanel.classList.add('hidden');
    insecureTab.classList.add('active');
    secureTab.classList.remove('active');
  } else {
    securePanel.classList.remove('hidden');
    insecurePanel.classList.add('hidden');
    secureTab.classList.add('active');
    insecureTab.classList.remove('active');
  }
}

// =============================================
// DASHBOARD — Animate progress ring & bars
// =============================================
function animateDashboard() {
  // Animate circular progress ring
  // 6/12 modules = 50% complete
  const totalModules = 12;
  const completedModules = 6;
  const pct = (completedModules / totalModules) * 100;

  const ring = document.getElementById('progressRing');
  const percentText = document.getElementById('ringPercent');
  
  if (!ring) return;
  
  const circumference = 2 * Math.PI * 50; // r=50
  
  // Animate counter from 0 to target
  let current = 0;
  const step = pct / 60;
  const counter = setInterval(() => {
    current = Math.min(current + step, pct);
    const dashArray = (circumference * current / 100) + ' ' + circumference;
    ring.setAttribute('stroke-dasharray', dashArray);
    percentText.textContent = Math.round(current) + '%';
    
    if (current >= pct) clearInterval(counter);
  }, 16);
}

// =============================================
// INTERSECTION OBSERVER — Trigger animations
// =============================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      
      // Trigger dashboard animations when section is visible
      if (entry.target.closest('#dashboard')) {
        animateDashboard();
      }
      
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards and blocks for scroll animations
document.querySelectorAll('.module-card, .featured-card, .news-card, .case-card, .dash-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  observer.observe(el);
});

// Observe dashboard section for progress animation trigger
const dashSection = document.getElementById('dashboard');
if (dashSection) {
  const dashObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateDashboard();
        dashObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  dashObserver.observe(dashSection);
}

// =============================================
// SMOOTH SCROLL — Enhanced for all nav links
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// =============================================
// TERMINAL TYPING EFFECT — Hero badge text
// =============================================
function typeText(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    }
  };
  type();
}

// =============================================
// MODULE CARD — Click to highlight
// =============================================
document.querySelectorAll('.module-card').forEach(card => {
  card.addEventListener('click', () => {
    // Show a brief feedback tooltip
    const feedback = document.createElement('div');
    feedback.textContent = '📖 Module loading... (Demo)';
    feedback.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem;
      background: var(--bg-card); border: 1px solid var(--green-accent);
      color: var(--green-accent); font-family: var(--font-mono); font-size: 0.85rem;
      padding: 0.75rem 1.25rem; border-radius: 8px; z-index: 999;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 0 20px rgba(0,229,160,0.2);
    `;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  });
});

// Slide in animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// =============================================
// CONSOLE MESSAGE — Easter egg for devs
// =============================================
console.log(`
%c🔐 CyberAcademy — Frontend Demo
%cBuilt for cybersecurity education
%cAll interactions are client-side only

Available global functions:
  openModal('login'|'signup')  - Open auth modal
  closeModal()                  - Close modal
  nextQuestion()                - Quiz navigation
  nextEmail()                   - Phishing examples
  nextScenario()                - Threat scenarios
  updateChecklist()             - Risk assessment
  switchPractice('secure'|'insecure') - Toggle practices
`,
'color: #00e5a0; font-size: 1.2em; font-weight: bold;',
'color: #2d9cdb;',
'color: #546e8a;'
);

// =============================================
// ACTIVE NAV LINK — Highlight on scroll
// =============================================
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let currentSection = '';
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navHeight - 20;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navAnchors.forEach(anchor => {
    anchor.style.color = '';
    if (anchor.getAttribute('href') === `#${currentSection}`) {
      anchor.style.color = 'var(--green-accent)';
    }
  });
}, { passive: true });
