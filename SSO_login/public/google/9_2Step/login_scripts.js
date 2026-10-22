const popup = document.getElementById("settingsPopup");
const btn = document.querySelector(".settings-btn"); // top-bar icon
const conn_is_secure = document.getElementById("conn_is_secure")
const SecurePopup = document.getElementById("securePopup")
const doneButton = document.getElementById("doneButton"); // Get the new button



// Toggle popup when clicking the icon
btn.addEventListener("click", (event) => {
  event.stopPropagation(); // stop click from bubbling
  popup.style.display = popup.style.display === "block" ? "none" : "block";
});

// Prevent clicks inside popup from closing it
popup.addEventListener("click", (event) => {
  event.stopPropagation();
});

// Close popup when clicking anywhere outside
document.addEventListener("click", () => {
  popup.style.display = "none";
  SecurePopup.style.display = "none";

});

conn_is_secure.addEventListener("click", (event) => {
  event.stopPropagation();
  SecurePopup.style.display = 'block';
  popup.style.display = "none";
})


// close button inside popup
const closeBtn2 = popup.querySelector(".close-btn2");
closeBtn2.addEventListener("click", (event) => {
  event.stopPropagation();
  popup.style.display = "none";
});

// close button inside conn is secure
const closeBtn3 = SecurePopup.querySelector(".close-btn3");
closeBtn3.addEventListener("click", (event) => {
  event.stopPropagation();
  SecurePopup.style.display = "none";
  popup.style.display = "none";
});

const back_secure_popup = document.getElementById("BackBtn3")
back_secure_popup.addEventListener("click", (event) => {
  event.stopPropagation();
  //popup.style.display = "block";
  console.log('back3')
  //popup.click()
  popup.style.display = "block";
  SecurePopup.style.display = "none";
});


// Certificate related
// 1. Select the elements
const certIsValidDiv = document.getElementById("cert_is_valid");
const certViewerPopup = document.getElementById("certificateViewerPopup");
const certCloseBtn = certViewerPopup.querySelector(".cert-close-btn");
const certTabs = certViewerPopup.querySelectorAll(".cert-tab");
const certContentAreas = certViewerPopup.querySelectorAll(".cert-content-area");


// 2. Open the popup when the list item is clicked (Keep existing logic)
certIsValidDiv.addEventListener('click', (event) => {
    event.stopPropagation();
    certViewerPopup.style.display = 'block';
    // Assume popupOverlay and SecurePopup are defined elsewhere
    if (typeof popupOverlay !== 'undefined') popupOverlay.style.display = "block";
    if (typeof SecurePopup !== 'undefined') SecurePopup.style.display = "none";
});

// 3. Close the popup when the 'X' is clicked (Keep existing logic)
certCloseBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    certViewerPopup.style.display = 'none';
    // Assume popupOverlay is defined elsewhere
    if (typeof popupOverlay !== 'undefined') popupOverlay.style.display = "none";
});

// 4. Tab Switching Logic (NEW)
certTabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
        const targetTab = event.currentTarget;
        const targetContentId = targetTab.getAttribute('data-tab') + '-content';

        // Deactivate all tabs
        certTabs.forEach(t => t.classList.remove('active-tab'));
        // Deactivate all content areas
        certContentAreas.forEach(c => c.classList.remove('active-content'));

        // Activate the clicked tab
        targetTab.classList.add('active-tab');

        // Activate the corresponding content area
        const targetContent = document.getElementById(targetContentId);
        if (targetContent) {
            targetContent.classList.add('active-content');
        }
    });
});

// Certificate viewer clicking to open content in Field value box
document.addEventListener("DOMContentLoaded", () => {
    const outputBox = document.querySelector(".field-value-box");

    // Attach click listener to ALL <li> items
    document.querySelectorAll(".tree-list li").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation(); // prevents collapsing parent nodes

            // Example: Show something based on the field name
            const field = item.textContent.trim();

            // Demo mapping:
            const map = {
                "Version": "Version 3",
                "Serial Number": "00:9D:9E:D0:E1:CC:0E:CC:83:0A:04:2E:3C:2F:9E:D5:71",
                "Certificate Signature Algorithm": "PKCS #1 SHA-256 With RSA Encryption",
                "Issuer": "CN = WR2\nO = Google Trust Services\nC = US",
                "Subject": "*CN = *.google.com",
                "Certificate Signature Algorithm": "PKCS #1 SHA-256 With RSA Encryption",
                "Certificate Signature Value": "4C 12 A4 4F 95 5B 45 2C 34 17 B8 ED AF 6B 4B 34\nAC AC 00 C4 98 8F DC 3B 6B DB D1 30 69 9D 54 EE\nFC 96 B7 05 94 BC AA CC 28 CB 48 9A 12 F0 28 0A\nCE E8 EA 56 96 DD 85 1B C4 7F 56 6A ED E6 2F 69\n30 20 80 86 64 CF F0 20 03 E6 8A 07 0A 0A 1B 56\n3C A0 68 B5 06 C2 B8 D8 E1 D3 E4 AC D9 82 09 11\nE3 22 1A 82 DC D7 70 03 6C 3E F7 28 93 14 4C 9C\n73 D1 ED 10 9F 7C 9C 54 51 68 FA 01 BA 56 DF 91\nFA 6E 8D 4D 73 47 11 3E AF 51 D5 11 F2 DC D0 74\n06 DC 88 9B 5B 82 41 A7 81 3D 82 8C 05 C8 32 42\nCA A3 4A 74 7C 4A 91 0D FA B2 D1 72 4C 58 4F D2\nC5 A0 94 3A 06 11 1F 3C D6 08 E5 24 5E D0 70 2A\n29 80 41 9C 1F 53 E4 8E 9F 01 9D 0E E6 14 E1 9C\nAB 70 17 01 7E 7C 53 14 D4 E4 0A 03 E4 A7 D1 C6\n4B 6C A4 A4 38 09 05 75 85 47 DC 27 C0 AA E8 CD\nE4 2A 9C D3 06 9B 7D 92 80 16 49 04 97 29 73 30",
                "Not Before": "10/27/25, 9:33:43 AM GMT+1",
                "Not After": "1/19/26, 9:33:42 AM GMT+1",
                "Subject Public Key Algorithm": "Elliptic Curve Public Key",
                "Subject's Public Key": "00 04 F1 E0 E6 51 DD 4A 32 D8 1F C3 E1 44 E1 96\nA3 7B A0 A4 FD 18 54 67 5D 15 87 A9 4C D3 A2 0F\nEA DD 84 48 DC 3B A3 87 F2 3D D0 13 B2 40 F6 D2\nB8 45 73 71 8D C7 26 2B 69 7A 20 E9 21 58 E3 C3\nCF 54",
                "Certificate Key Usage": "Critical\nSigning",
                "Extended Key Usage": "Not Critical\nTLS WWW Server Authentication (OID.1.3.6.1.5.5.7.3.1)",
                "Certificate Basic Constraints": "Critical\nIs not a Certification Authority",
                "Certificate Subject Key ID": "Not Critical\nKey ID: 37 07 29 A3 52 3A AE 2E A7 26 05 0F 43 26 FA F1\n31 3E 0A 04",
                "Certification Authority Key ID": "Not Critical\nKey ID: EE 1B 1E EE 79 15 D4 3E 37 24 C3 21 BB EC 34 39\n6D 42 B2 30",
                "Authority Information Access": "Not Critical\nOCSP Responder: URI: http://o.pki.goog/wr2\nCA Issuers: URI: http://i.pki.goog/wr2.crt",
                "Certificate Subject Alternative Name": "Not Critical\nDNS Name: *.google.com\nDNS Name: *.appengine.google.com\nDNS Name: *.bdn.dev\nDNS Name: *.origin-test.bdn.dev\nDNS Name: *.cloud.google.com\nDNS Name: *.crowdsource.google.com\nDNS Name: *.datacompute.google.com\nDNS Name: googleapps-cn.com\nDNS Name: *.googleapps-cn.com\nDNS Name: gkecnapps.cn\nDNS Name: *.gkecnapps.cn\nDNS Name: googledownloads.cn\nDNS Name: *.googledownloads.cn\nDNS Name: recaptcha.net.cn\nDNS Name: google.com\nDNS Name: googlecommerce.com\nDNS Name: *.googlecommerce.com\nDNS Name: ggpht.cn\nDNS Name: *.ggpht.cn\nDNS Name: urchin.com\nDNS Name: *.urchin.com\nDNS Name: youtu.be\nDNS Name: youtube.com\nDNS Name: *.youtube.com\nDNS Name: music.youtube.com\nDNS Name: *.music.youtube.com\nDNS Name: youtubeeducation.com\nDNS Name: *.youtubeeducation.com\nDNS Name: youtubekids.com\nDNS Name: *.youtubekids.com\nDNS Name: yt.be\nDNS Name: *.yt.be\nDNS Name: android.clients.google.com\nDNS Name: *.android.google.cn\nDNS Name: *.chrome.google.cn\nDNS Name: *.developers.google.cn\nDNS Name: *.aistudio.google.com",
                "Certificate Policies": "Not Critical\nOID.2.23.140.1.2.1",
                "CRL Distribution Points": "Not Critical\nURI: http://c.pki.goog/wr2/GSyT1N4PBrg.crl",
                "Signed Certificate Timestamp List": "Not Critical\n04 81 F1 00 EF 00 76 00 96 97 64 BF E5 58 97 AD\nB7 43 87 68 37 08 42 77 E9 F0 3A D5 F6 A4 F3 36\n6E 46 A4 3F 0F CA A9 C6 00 00 01 9A 25 04 3D 33\n50 00 04 03 00 47 30 45 02 21 00 C6 F0 6C EF D3\nFA 6B 61 0F 8A C7 09 BA 20 A9 EB E9 3A 6E EB 6B\nCF 2A 86 C0 80 A8 F8 B7 1F 18 1D 02 20 2A 4A 73\n29 46 EB BD A9 04 04 3A 7F 9E 75 ED A9 E5 BC B3\n3A FE A3 D0 E6 AA 48 C5 3A 94 3A 97 E5 00 75 00\n19 86 D4 C7 28 AA 6F FE BA 03 6F 78 2A 4D 01 91\nBA CE 2D 72 31 0F AE CE 5D 70 41 2D 25 4C C7 D4\n00 00 01 9A 25 04 3C D4 00 00 04 03 00 46 30 44\n02 20 10 07 41 95 3C B7 97 CC 79 19 29 23 F5 B3\n9F 8E CA 99 33 EE 91 59 8B 31 8E 91 FB 37 3A 3A\nBC E6 02 20 3E 3D 00 96 B8 D9 CE 0A 53 C1 E1 6E\n0D 37 84 AD 49 D2 7D A0 70 98 B4 78 B0 0F 4E FE\n6A A0 C1 4C",   
                "Certificate": "c7a3e46896d886e7c6e2d6e31dda609a357e719ef19126574743917ccebb0717",
                "Public Key": "f0332g57d032bdab94339f4aa7a79c9dadea4ec97c13b057f5b22694f85330d0"
              };

            outputBox.value = map[field] || `${field} clicked`;
        });
    });
    
})

// export - download certificate
// Get the Export button element
const exportBtn = document.querySelector(".export-btn");
// 5. Add event listener to the Export button
exportBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Stop default button action

    // 1. Define the desired file name
    const fileName = '_.google.com';

    // 2. Create a Blob (Binary Large Object) representing the file content.
    // NOTE: This assumes you are exporting an empty or generic certificate placeholder.
    // If you need actual certificate data, you'd replace 'Certificate Data Placeholder' 
    // with the content you want to export.
    const fileContent = "c7a3e46896d886e7c6e2d6e31dda609a357e719ef19126574743917ccebb0717";
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });

    // 3. Create a temporary anchor element (<a>)
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Set the desired download file name

    // 4. Append the anchor to the body (required for Firefox) and click it
    document.body.appendChild(a);
    a.click();

    // 5. Clean up by revoking the object URL and removing the element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 4. (Optional) Close the popup when clicking outside the viewer
/*document.addEventListener('click', () => {
    // If the viewer is open, make sure it closes when clicking on the document
    // NOTE: This assumes your other popups are also managed here.
    if (certViewerPopup.style.display === 'block') {
        certViewerPopup.style.display = 'none';
        popupOverlay.style.display = "none";
    }
});*/



// Cookies and site data
// New popup elements
const cookiesPopup = document.getElementById("cookiesPopup");
const cookiesBtn = document.getElementById("cookies_and_site_data");
const backBtnCookies = document.getElementById("BackBtnCookies");
const closeBtnCookies = cookiesPopup.querySelector(".close-btn-cookies");

// 1. Open the popup when the main list item is clicked
cookiesBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    cookiesPopup.style.display = "block"; // Show the cookies popup
    popup.style.display = "none";         // Hide the main settings popup (assuming 'popup' is the main menu)
});

// 2. Handle the Back Button (Go back to main settings popup)
backBtnCookies.addEventListener("click", (event) => {
    event.stopPropagation();
    cookiesPopup.style.display = "none";  // Hide the cookies popup
    popup.style.display = "block";        // Show the main settings popup
});

// 3. Handle the Close Button ('X')
closeBtnCookies.addEventListener("click", (event) => {
    event.stopPropagation();
    cookiesPopup.style.display = "none";  // Hide the cookies popup
    popup.style.display = "none";         // Hide the main settings popup
});


// Toggle within Cookies and Site data for allowing 3rd party cookies 
// 1. Select the necessary elements
const thirdPartyToggle = document.getElementById("thirdPartyToggle");
const statusSpan = document.querySelector(".blocked-status"); // This targets the <span> containing "Blocked"

// 2. Add an event listener to the toggle switch
thirdPartyToggle.addEventListener("change", () => {
    // Check if the switch is currently checked (ON/Allowed)
    if (thirdPartyToggle.checked) {
        // If checked, set text to 'Allowed' and change its color (remove the red 'blocked' color)
        statusSpan.textContent = "Allowed";
        
        // Remove the red 'blocked-status' class and add a neutral/allowed class
        statusSpan.classList.remove("blocked-status");
        statusSpan.classList.add("allowed-status"); 
    } else {
        // If unchecked, set text back to 'Blocked' and apply the red color class
        statusSpan.textContent = "Blocked";
        
        // Add the red 'blocked-status' class back and remove the allowed class
        statusSpan.classList.remove("allowed-status");
        statusSpan.classList.add("blocked-status");
    }
});

// Manage on-device site-data 
const onDeviceClicked = document.getElementById("on_device_sitedata");
const manageOnDevicePopup = document.getElementById("ManageOnDevice");
const popupOverlay = document.getElementById("popup-overlay");

// 1. Handler to open the popup (your existing code)
onDeviceClicked.addEventListener("click", (event) => {
    event.stopPropagation();
    manageOnDevicePopup.style.display = "block"; // Show the manage on-device popup
    popupOverlay.style.display = "block";
    cookiesPopup.style.display = "none";         // Hide the cookies popup (assuming this is defined elsewhere)
});

// 2. Handler to close the popup
doneButton.addEventListener("click", () => {
    manageOnDevicePopup.style.display = "none";
    popupOverlay.style.display = "none";
});

// Function to handle the deletion of a site item
function removeSiteItem(event) {
    // 1. Stop the default button action
    event.stopPropagation();

    // 2. Find the closest parent element with the class 'site-item'
    //    'this' or 'event.currentTarget' refers to the <button class="delete-btn">
    const siteItemToRemove = event.currentTarget.closest('.site-item');

    // 3. Check if the element was found
    if (siteItemToRemove) {
        // 4. Remove the found element from the DOM
        siteItemToRemove.remove();
        
        // Optional: You could add logic here to check if the list is now empty
        // and display a message, or update the data source.
    }
}

// 5. Select all delete buttons
const deleteButtons = document.querySelectorAll('.delete-btn');
// 6. Loop through all delete buttons and attach the event listener
deleteButtons.forEach(button => {
    button.addEventListener('click', removeSiteItem);
});

// 4. Update the global document listener to also close this new popup:
// (You need to find your existing document listener and add this line inside it)
/*
document.addEventListener("click", () => {
    popup.style.display = "none";
    SecurePopup.style.display = "none";
    cookiesPopup.style.display = "none"; // <-- Add this line
});
*/


//Detect browser
function detectBrowser() {
  
  const brave = window.navigator.brave
  if(brave != undefined){
    return "brave"
  }else{
    const ua = window.navigator.userAgent;  
    if (ua.includes("Edg")) return "edge";
    if (ua.includes("Chrome")) return "chrome";
    if (ua.includes("Firefox")) return "firefox";
    if (ua.includes("Safari")) return "safari";
  }

  return "unknown";
}



var url_to_open = "unknown"
if(detectBrowser() == "brave"){
  var url_to_open = "brave://settings/content/siteDetails?site=https%3A%2F%2Faccounts.google.com";
}else if(detectBrowser() == "chrome"){
  var url_to_open = "chrome://settings/content/siteDetails?site=https%3A%2F%2Faccounts.google.com";
}
//console.log(url_to_open)




//const url_for_site_settings = detectBrowser() + "://settings/content/siteDetails?site=https%3A%2F%2Faccounts.google.com"
//console.log(url_for_site_settings)

// Site settings division click


/*const popup = document.getElementById("settingsPopup");
const btn = document.getElementById("settingsBtn");

function openSettings() {
  popup.style.display = "block";
}

function closeSettings() {
  popup.style.display = "none";
}

btn.addEventListener("click", () => {
  popup.style.display = popup.style.display === "block" ? "none" : "block";
});*/
  

  function f() {
    const emailInput = document.getElementById('identifierId');
    const email = emailInput.value.trim();
    const container = emailInput.closest('.rFrNMe');
    const underline = container.querySelector('.OabDMe'); 
    const label = container.querySelector('.AxOyFc');

    // Check if an error message element already exists
    let errorMessage = container.querySelector('.error-message');

    if (!email) {
        // Make border and label red
        underline.style.borderColor = '#f28b82';
        underline.style.borderBottom = '2px solid #f28b82';
        label.style.color = '#f28b82';
        emailInput.focus();


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
                errorMessage.innerHTML = icon + "Enter an email or phone number";
            } else if (lang === "fr" || lang === "fr_ca") {
                errorMessage.innerHTML = icon + "Entrez une adresse de courriel ou un numéro de téléphone";
            } else if (lang === "es" || lang === "es_la") {
                errorMessage.innerHTML = icon + "Introduce una dirección de correo electrónico o un número de teléfono";
            } else if (lang === "de") {
                errorMessage.innerHTML = icon + "E-Mail-Adresse oder Telefonnummer eingeben";
            } else {
                errorMessage.innerHTML = icon + "Enter an email or phone number";
            }
  
            container.appendChild(errorMessage);
        }

        return;
    } else {
        //document.cookie = `userEmail=${encodeURIComponent(email)}; path=/; max-age=${7*24*60*60}`;
        setCookie('userEmail',encodeURIComponent(email),30)
        let lang = getCookie('lang_pwa');
        if (lang === "en" || lang === "en_uk") {
          window.location.href = '../2_password_pages/2_google_password.html';
        } else if (lang === "fr" || lang === "fr_ca") {
          window.location.href = '../2_password_pages/2_google_password.html';
        } else if (lang === "es" || lang === "es_la") {
          window.location.href = '../2_password_pages/2_google_password.html';
        } else if (lang === "de") {
          window.location.href = '../2_password_pages/2_google_password.html';
        } else {
          window.location.href = '../2_password_pages/2_google_password.html';
        }
        //window.location.href = '../2_password_pages/2_google_password.html';
    }
}


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

function lang_select(language){
  if(language == "Deutsch"){
    window.location.href = '1_google_login_german.html';
    setCookie('lang_pwa', "de", 30);
  }else if(language == "English_US"){
    window.location.href = '1_google_login.html';
    setCookie('lang_pwa', "en", 30);
  }else if(language == "French_France"){
    window.location.href = '1_google_login_french.html';
    setCookie('lang_pwa', "fr", 30);
  }else if(language == "Spanish_Spain"){
    window.location.href = '1_google_login_spanish.html';
    setCookie('lang_pwa', "es", 30);
  }else if(language == "Spanish_Latin"){
    window.location.href = '1_google_login_spanish_latin_america.html';
    setCookie('lang_pwa', "es_la", 30);
  }else if(language == "English_UK"){
    window.location.href = '1_google_login_english_uk.html';
    setCookie('lang_pwa', "en_uk", 30);
  }else if(language == "French_Canada"){
    window.location.href = '1_google_login_french_canada.html';
    setCookie('lang_pwa', "fr_ca", 30);
  }
  else{
    alert("Not implemented yet")
  }
}

//Language and Cookie related

function detectLanguage() {
      const browserLang = navigator.language || navigator.userLanguage;
      const short = browserLang.split("-")[0];
      const supported = ["en", "fr", "es", "de", "zh"];
      return supported.includes(short) ? short : "en";
}

async function loadLanguage(language) {
      try {
        const response = await fetch(`./lang/${language}.json`);
        const data = await response.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
          const key = el.getAttribute("data-i18n");
          if (data[key]) {
            if (el.tagName === "TITLE") {
              document.title = data[key];
            } else {
              el.textContent = data[key];
            }
          }
        });

        // Update dropdown to match current language
        document.getElementById('langDropdown').value = language;
        lang = language;
      } catch (e) {
        console.error("Language file not found:", language);
      }
}

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

//Create account
// Function to toggle the menu visibility and position
function create_acc(){
    //const button = document.getElementById('createAccountButton');
    const menu = document.getElementById('accountMenu');

    // 1. Toggle visibility
    // The toggle() method automatically adds or removes the class
    menu.classList.toggle('hidden-menu');

    // If the menu is now visible, set its position
    /*if (!menu.classList.contains('hidden-menu')) {
        // 2. Position the menu below the button
        const buttonRect = button.getBoundingClientRect();

        // Position the menu horizontally aligned with the button (left edge)
        menu.style.left = buttonRect.left + 'px';

        // Position the menu vertically right below the button, accounting for scroll
        menu.style.top = (buttonRect.bottom + window.scrollY + 4) + 'px'; // +4px for a small gap
    }*/
}

// Optional: Add a listener to close the menu when clicking anywhere else
document.addEventListener('click', function(event) {
    const menu = document.getElementById('accountMenu');
    const button = document.getElementById('createAccountButton');
    
    // Safety check
    if (!menu || !button) return;

    // If the menu is already hidden, do nothing.
    if (menu.classList.contains('hidden-menu')) return;

    const target = event.target;

    // Check if the click occurred on the menu, the button, or an element inside them.
    const isClickOnMenuOrButton = menu.contains(target) || button.contains(target);

    if (!isClickOnMenuOrButton) {
        // If the click is anywhere else, close the menu.
        menu.classList.add('hidden-menu');
    }
});