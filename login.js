 
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.querySelector(`#${inputId} + .password-toggle`);

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = 'block';

  if (type === 'error') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

function hideMessage(elementId) {
  document.getElementById(elementId).style.display = 'none';
}

function setLoading(buttonElement, isLoading) {
  const loadingIcon = buttonElement.querySelector('.loading');
  const btnText = buttonElement.querySelector('.btn-text');

  if (isLoading) {
    buttonElement.classList.add('loading');
    buttonElement.disabled = true;
    if (loadingIcon) loadingIcon.style.display = 'inline-block';
    if (btnText) btnText.style.display = 'none';
  } else {
    buttonElement.classList.remove('loading');
    buttonElement.disabled = false;
    if (loadingIcon) loadingIcon.style.display = 'none';
    if (btnText) btnText.style.display = 'inline-block';
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: "user"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, data };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function formatBackendError(data) {
  // If it's a simple string message
  if (typeof data === "string") return data;

  // If it's a message key
  if (data.message) return data.message;

  // If it's an error key
  if (data.error) return data.error;

  // If it's a validation object like { email: ["msg"], password: ["msg"] }
  let formatted = "";
  for (let key in data) {
    if (Array.isArray(data[key])) {
      formatted += `${key}: ${data[key][0]}\n`;
    }
  }

  return formatted.trim() || "An unknown error occurred.";
}

async function signin() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const submitBtn = document.querySelector('#loginForm .submit-btn');

  if (!email || !password) {
    return showMessage("loginMessage", "Please enter email and password.", "error");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return showMessage("loginMessage", "Please enter a valid email address.", "error");
  }

  setLoading(submitBtn, true);
  hideMessage("loginMessage");

  try {
    const result = await loginUser(email, password);

    if (result.success) {
      if (result.data.token || result.data.access_token) {
        localStorage.setItem("authToken", result.data.token || result.data.access_token);
      }

      if (result.data.user) {
        localStorage.setItem("userData", JSON.stringify(result.data.user));
      }

      showMessage("loginMessage", "Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 2000);

    } else {
      const errorMessage = formatBackendError(result.data);
      showMessage("loginMessage", errorMessage, "error");
    }
  } catch (err) {
    showMessage("loginMessage", "Error logging in. Please try again.", "error");
  } finally {
    setLoading(submitBtn, false);
  }
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  signin();
});

window.togglePassword = togglePassword;
