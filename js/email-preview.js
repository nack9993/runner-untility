// Email Preview functionality

// Email template content
const emailTemplate = `<div
  style="
    font-family: 'Inter', system-ui, sans-serif;
    max-width: 460px;
    margin: 50px auto;
    padding: 20px;
    background-color: #000000;
    color: #ffff00;
  "
>
  <img
    src="https://firebasestorage.googleapis.com/v0/b/flutter-1f2ab.firebasestorage.app/o/email%2FScreenshot%202568-07-29%20at%2016.02.17.png?alt=media&token=be4da920-b24a-4ea9-9274-a3a5386ec8d8"
    alt="Google Logo"
    style="width: 300px; height: 100px; display: block; margin: 0 auto"
  />
  <div style="margin-bottom: 8px; font-size: 14px; color: #ffff00">
    Hello, \${name}
  </div>

  <!-- Registration Number Section - Prominent Display -->
  <div
    style="
      background: linear-gradient(135deg, #ffff00, #ffd700);
      color: #000000;
      font-weight: bold;
      font-size: 18px;
      text-align: center;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(255, 255, 0, 0.3);
      border: 2px solid #ffff00;
    "
  >
    REGISTRATION NUMBER: \${registerNumber}
  </div>

  <div
    style="
      color: #ffff00;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    "
  >
    Congratulations! You have been selected to participate in the "Jog and Jive"
    event,<br />
    a collaboration between Central Airport Chiangmai x FABURUNS CLUB<br />
    on August 16, 2025, from 06:00-10:00 AM.<br /><br />
    <br />
    This will be a City Run from Robinson to the Old Town area. It's organized
    on a quite large scale with 100 participants.<br /><br />

    <strong>Event Schedule Overview:</strong><br />
    • 06:15 – 06:45 Registration + Games<br />
    • 06:45 – 07:00 Warm-up<br />
    • 07:00 – 08:00 Start Running<br />
    • 08:00 – 09:00 Lucky Draw / DJ / Coffee & Chill
  </div>
  <div style="height: 1px; background: #333333; margin: 24px 0"></div>
  <div style="color: #cccc00; font-size: 12px">
    This message was sent automatically
  </div>
</div>`;

let currentEmailContent = '';

// Initialize email preview functionality
function initializeEmailPreview() {
  setupEmailEventListeners();
  updateEmailPreview();
}

// Set up event listeners for email preview controls
function setupEmailEventListeners() {
  // Update email preview button
  const updateBtn = document.getElementById('updateEmailBtn');
  if (updateBtn) {
    updateBtn.addEventListener('click', updateEmailPreview);
  }

  // Copy email HTML button
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyEmailHTML);
  }

  // Download email HTML button
  const downloadBtn = document.getElementById('downloadEmailBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadEmailHTML);
  }

  // Reset template button
  const resetBtn = document.getElementById('resetTemplateBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTemplate);
  }

  // Auto-update on input changes
  const nameInput = document.getElementById('recipientName');
  const regInput = document.getElementById('registrationNumber');
  
  if (nameInput && regInput) {
    nameInput.addEventListener('input', updateEmailPreview);
    regInput.addEventListener('input', updateEmailPreview);
  }
}

// Update the email preview with current input values
function updateEmailPreview() {
  const nameInput = document.getElementById('recipientName');
  const regInput = document.getElementById('registrationNumber');
  const previewContent = document.getElementById('emailPreviewContent');

  if (!nameInput || !regInput || !previewContent) return;

  const name = nameInput.value || 'John Runner';
  const registerNumber = regInput.value || 'JJ2025-001';

  // Replace template variables
  currentEmailContent = emailTemplate
    .replace(/\$\{name\}/g, name)
    .replace(/\$\{registerNumber\}/g, registerNumber);

  // Display the email content
  previewContent.innerHTML = currentEmailContent;
}

// Copy email HTML to clipboard
async function copyEmailHTML() {
  const copyBtn = document.getElementById('copyEmailBtn');
  
  try {
    await navigator.clipboard.writeText(currentEmailContent);
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✅ Copied!';
    copyBtn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
    
  } catch (err) {
    console.error('Failed to copy: ', err);
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = currentEmailContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Visual feedback
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✅ Copied!';
    copyBtn.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  }
}

// Download email HTML as a file
function downloadEmailHTML() {
  const nameInput = document.getElementById('recipientName');
  const regInput = document.getElementById('registrationNumber');
  
  const name = nameInput?.value || 'John Runner';
  const registerNumber = regInput?.value || 'JJ2025-001';
  
  // Create complete HTML document
  const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Email - ${name} (${registerNumber})</title>
</head>
<body>
${currentEmailContent}
</body>
</html>`;

  // Create blob and download
  const blob = new Blob([completeHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `email-${registerNumber.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Visual feedback
  const downloadBtn = document.getElementById('downloadEmailBtn');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '✅ Downloaded!';
  downloadBtn.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    downloadBtn.innerHTML = originalText;
    downloadBtn.style.backgroundColor = '';
  }, 2000);
}

// Reset template to default values
function resetTemplate() {
  const nameInput = document.getElementById('recipientName');
  const regInput = document.getElementById('registrationNumber');
  
  if (nameInput && regInput) {
    nameInput.value = 'John Runner';
    regInput.value = 'JJ2025-001';
    updateEmailPreview();
  }

  // Visual feedback
  const resetBtn = document.getElementById('resetTemplateBtn');
  const originalText = resetBtn.innerHTML;
  resetBtn.innerHTML = '✅ Reset!';
  resetBtn.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    resetBtn.innerHTML = originalText;
    resetBtn.style.backgroundColor = '';
  }, 1500);
}

// Make function available globally
window.initializeEmailPreview = initializeEmailPreview;

// Initialize when DOM is loaded if email preview page is active
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('email-preview') && document.getElementById('email-preview').classList.contains('active')) {
    initializeEmailPreview();
  }
}); 