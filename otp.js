 let countdown = 60;
let countdownInterval;
let otp = [];   

const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get("email");
const otpType = urlParams.get("type") || "create";

if (userEmail) {
  document.getElementById("otpEmail").textContent = userEmail;
}

function setupOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      if (!/^\d$/.test(e.target.value)) {
        e.target.value = '';
        return;
      }
      e.target.classList.remove('error');
      if (e.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      if (index === inputs.length - 1 && isAllFieldsFilled()) {
        setTimeout(() => {
          document.getElementById('otpForm').dispatchEvent(new Event('submit'));
        }, 100);
      }
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace') {
        if (!e.target.value && index > 0) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
        }
        e.target.classList.remove('error');
      }
      if (e.key === 'Enter' && isAllFieldsFilled()) {
        e.preventDefault();
        document.getElementById('otpForm').dispatchEvent(new Event('submit'));
      }
    });

    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      const cleanPaste = paste.replace(/\D/g, '').slice(0, 6);
      if (cleanPaste.length === 6) {
        inputs.forEach((inp, idx) => {
          inp.value = cleanPaste[idx] || '';
          inp.classList.remove('error');
        });
        setTimeout(() => {
          document.getElementById('otpForm').dispatchEvent(new Event('submit'));
        }, 100);
      }
    });
  });
}

 


function isAllFieldsFilled() {
  const inputs = document.querySelectorAll('.otp-input');
  return Array.from(inputs).every(input => input.value.trim() !== '');
}

function getOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  return Array.from(inputs).map(input => input.value); 
}

function clearOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('error');
  });
  document.getElementById('digit1').focus();
}

function addErrorToInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach(input => input.classList.add('error'));
}

function showMessage(message, type) {
  const messageEl = document.getElementById('otpMessage');
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;
  messageEl.style.display = "block";
  if (type === 'error') {
    setTimeout(() => { messageEl.style.display = 'none'; }, 5000); 
  }
}

function hideMessage() {
  document.getElementById('otpMessage').style.display = 'none';
}

function setLoading(buttonElement, isLoading) {
  if (isLoading) {
    buttonElement.classList.add('loading');
    buttonElement.disabled = true;
  } else {
    buttonElement.classList.remove('loading');
    buttonElement.disabled = false;
  }
}

function startCountdown() {
  clearInterval(countdownInterval); 
  countdown = 60;
  document.getElementById('countdown').textContent = countdown;
  document.getElementById('otpTimer').style.display = 'block';
  document.getElementById('resendBtn').classList.add('disabled');

  countdownInterval = setInterval(() => {
    countdown--;
    document.getElementById('countdown').textContent = countdown;
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      document.getElementById('otpTimer').style.display = 'none';
      document.getElementById('resendBtn').classList.remove('disabled');
    }
  }, 1000);
}

async function verifyOTP(otp) {
  try {
    const otpCode = Array.isArray(otp) ? otp.join("") : otp;
    console.log('Verifying OTP:', otpCode, 'for email:', userEmail, 'type:', otpType);
    
    const requestBody = {
      email: userEmail,
      otp_code: otpCode,
      otp_type: otpType,
      role: "user"
    };
    
    console.log('OTP verification request:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/otp/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.log('Failed to parse OTP response JSON:', parseError);
      const textResponse = await response.text();
      console.log('Raw OTP response:', textResponse);
      data = { message: 'Invalid response format' };
    }
    
    console.log('OTP verification response status:', response.status);
    console.log('OTP verification response data:', data);
    
    return { 
      success: response.ok, 
      data: data,
      status: response.status 
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: error.message };
  }
}

async function registerUser(verificationToken) {
  try {
     let signupData = window.signupData;
    if (!signupData) {
      try {
        const storedData = sessionStorage.getItem('signupData');
        if (storedData) {
          signupData = JSON.parse(storedData);
          window.signupData = signupData;
        }
      } catch (error) {
        console.log('Error parsing stored signup data:', error);
      }
    }
    
    console.log('Signup data for registration:', signupData);  
    
     if (!signupData || !signupData.first_name || !signupData.email || !signupData.password) {
      throw new Error('Missing required signup data (first_name, email, or password)');
    }
    if (!verificationToken || verificationToken === 'null' || verificationToken === 'undefined') {
      throw new Error('Verification token is required and must be a valid string for registration');
    }
    
     let profileImageData = null;
    if (signupData.profile_image && signupData.profile_image.data) {
      profileImageData = signupData.profile_image.data;
    } else if (signupData.profile_image && typeof signupData.profile_image === 'string') {
      profileImageData = signupData.profile_image;
    }
    
    const body = {
      first_name: signupData.first_name,
      last_name: signupData.last_name || "",
      username: signupData.username || signupData.email,
      email: signupData.email,
      phone_number: signupData.phone_number || "",
      password: signupData.password,
      confirm_password: signupData.confirm_password || signupData.password,
      profile_image: profileImageData,
      verification_token: String(verificationToken), 
      role: "user"  
    };
    
    console.log('Registration payload:', {
      ...body,
      profile_image: body.profile_image ? '[BASE64_DATA]' : null,
      password: '[HIDDEN]',
      confirm_password: '[HIDDEN]'
    }); 
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.log('Failed to parse response JSON:', parseError);
      const textResponse = await response.text();
      console.log('Raw response:', textResponse);
      data = { message: 'Invalid response format' };
    }
    
    console.log('Registration response status:', response.status);
    console.log('Registration response data:', data);
    
    return { 
      success: response.ok, 
      data: data,
      status: response.status 
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

async function sendOTP(email, otpType = "create") {
  try {
    const response = await fetch(`${API_BASE_URL}/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, otp_type: otpType, role: "user" })
    });
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function validateSignupData() {
   let signupData = window.signupData;
  if (!signupData) {
    try {
      const storedData = sessionStorage.getItem('signupData');
      if (storedData) {
        signupData = JSON.parse(storedData);
        window.signupData = signupData;  
      }
    } catch (error) {
      console.log('Error parsing stored signup data:', error);
    }
  }
  
  if (!signupData) {
    console.log('No signup data found in window or sessionStorage');  
    return false;
  }
  
   const required = ['first_name', 'email', 'password'];
  const missing = required.filter(field => !signupData[field]);
  if (missing.length > 0) {
    console.log('Missing fields:', missing);  
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function() {
   if (!window.signupData) {
    try {
      const storedData = sessionStorage.getItem('signupData');
      if (storedData) {
        window.signupData = JSON.parse(storedData);
        console.log('Restored signup data from sessionStorage:', window.signupData);
      }
    } catch (error) {
      console.log('Error restoring signup data:', error);
    }
  }
  
  setupOTPInputs();
  startCountdown();
  document.getElementById('digit1').focus();

  document.getElementById('otpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    otp = getOTP();

    if (!otp || otp.length !== 6 || otp.includes("")) {   
      addErrorToInputs();
      showMessage('Please enter a valid 6-digit OTP.', 'error');
      return;
    }

    const verifyBtn = document.getElementById('verifyBtn');
    setLoading(verifyBtn, true);
    hideMessage();

    try {
      const verifyResult = await verifyOTP(otp);

      if (verifyResult.success) {
        showMessage('OTP verified successfully!', 'success');
        
         let verificationToken = null;
        if (verifyResult.data && verifyResult.data.verification_token) {
          verificationToken = String(verifyResult.data.verification_token);
        } else if (verifyResult.data && verifyResult.data.token) {
          verificationToken = String(verifyResult.data.token);
        } else if (verifyResult.data && verifyResult.data.otp_token) {
          verificationToken = String(verifyResult.data.otp_token);
        } else {
           verificationToken = String(Array.isArray(otp) ? otp.join("") : otp);
        }
        
        console.log('Extracted verification token:', verificationToken, 'Type:', typeof verificationToken);
        
         if (validateSignupData() && verificationToken) {
          console.log('Proceeding with registration');  
          const registerResult = await registerUser(verificationToken);
          
          if (registerResult.success) {
            showMessage('Registration completed! Redirecting to login...', 'success');
            setTimeout(() => {
              window.signupData = null;  
              sessionStorage.removeItem('signupData');  
              window.location.href = "login.html";
            }, 2000);
          } else {
            let errorMessage = 'Registration failed: ';
            if (registerResult.data && registerResult.data.message) {
              errorMessage += registerResult.data.message;
            } else if (registerResult.data && registerResult.data.error) {
              errorMessage += registerResult.data.error;
            } else if (registerResult.data && registerResult.data.details) {
              errorMessage += JSON.stringify(registerResult.data.details);
            } else if (registerResult.error) {
              errorMessage += registerResult.error;
            } else {
              errorMessage += `Unknown error occurred (Status: ${registerResult.status})`;
            }
            console.error('Registration failed:', registerResult);
            showMessage(errorMessage, 'error');
            if (registerResult.status === 400 || registerResult.status === 401) {
              clearOTP();
            }
          }
        } else {
           showMessage('OTP verified successfully! You can now proceed.', 'success');
          setTimeout(() => { 
            window.location.href = "login.html"; 
          }, 2000);
        }
        
      } else {
        addErrorToInputs();
        let errorMessage = 'Invalid OTP. Please try again.';
        if (verifyResult.data && verifyResult.data.message) {
          errorMessage = verifyResult.data.message;
        } else if (verifyResult.error) {
          errorMessage = verifyResult.error;
        }
        showMessage(errorMessage, 'error');
        clearOTP();
      }
    } catch (error) {
      showMessage('Network error. Please try again.', error);
      clearOTP();
    } finally {
      setLoading(verifyBtn, false);
    }
  });

  document.getElementById('resendBtn').addEventListener('click', async function() {
    if (this.classList.contains('disabled')) return;
    try {
      const result = await sendOTP(userEmail, otpType);
      if (result.success) {
        clearOTP();
        showMessage('New OTP sent successfully!', 'info');
        startCountdown();
        setTimeout(() => { hideMessage(); }, 3000);
      } else {
        const errorMessage = result.data?.message || result.error || 'Failed to resend OTP';
        showMessage(errorMessage, 'error');
      }
    } catch (error) {
      showMessage('Error resending OTP. Please try again.', error);
    }
  });

  document.getElementById('backBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to go back? You will need to fill the form again.')) {
      window.location.href = 'signup.html';
    }
  });
});