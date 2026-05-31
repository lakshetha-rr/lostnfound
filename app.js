/* =========================
   LOCAL DATABASE HELPERS
========================= */

function getLostItems() {
    return JSON.parse(localStorage.getItem("lostItems")) || [];
}

function saveLostItems(items) {
    localStorage.setItem("lostItems", JSON.stringify(items));
}

function getFoundItems() {
    return JSON.parse(localStorage.getItem("foundItems")) || [];
}

function saveFoundItems(items) {
    localStorage.setItem("foundItems", JSON.stringify(items));
}

function getProfile() {
    return JSON.parse(localStorage.getItem("profile")) || {};
}

function saveProfile(profile) {
    localStorage.setItem("profile", JSON.stringify(profile));
}

function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

function getClaims() {
    return JSON.parse(localStorage.getItem("claims")) || [];
}

function saveClaims(claims) {
    localStorage.setItem("claims", JSON.stringify(claims));
}

/* =========================
   IMAGE → BASE64 CONVERTER
========================= */

function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
}

/* =========================
   IMAGE PREVIEW SYSTEM
========================= */

const lostPreview = document.querySelector("#lost-preview") || null;
const foundPreview = document.querySelector("#found-preview") || null;

const lostImageInput = document.querySelector("#lost-image") || null;
const foundImageInput = document.querySelector("#found-image") || null;

if (lostImageInput && lostPreview) {
    lostImageInput.addEventListener("change", () => {
        const file = lostImageInput.files[0];
        if (!file) return;

        convertImageToBase64(file, base64 => {
            lostPreview.src = base64;
            lostPreview.style.display = "block";
        });
    });
}

if (foundImageInput && foundPreview) {
    foundImageInput.addEventListener("change", () => {
        const file = foundImageInput.files[0];
        if (!file) return;

        convertImageToBase64(file, base64 => {
            foundPreview.src = base64;
            foundPreview.style.display = "block";
        });
    });
}

/* =========================
   LOST ITEM SUBMISSION
========================= */

const lostForm = document.querySelector("#lost-form");

if (lostForm) {
    lostForm.addEventListener("submit", e => {
        e.preventDefault();

        const file = lostImageInput?.files[0];

        const processItem = (imageData = null) => {
            const name = document.querySelector("#lost-name")?.value || "";
            const category = document.querySelector("#lost-category")?.value || "";
            const color = document.querySelector("#lost-color")?.value || "";
            const location = document.querySelector("#lost-location")?.value || "";

            const item = {
                id: generateId(),
                name,
                category,
                color,
                location,
                image: imageData,
                status: "lost"
            };

            const items = getLostItems();
            items.push(item);
            saveLostItems(items);

            alert("Lost item registered!");
            lostForm.reset();
            if (lostPreview) lostPreview.style.display = "none";

            renderMatches();
        };

        if (file) convertImageToBase64(file, base64 => processItem(base64));
        else processItem();
    });
}

/* =========================
   FOUND ITEM SUBMISSION
========================= */

const foundForm = document.querySelector("#found-form");

if (foundForm) {
    foundForm.addEventListener("submit", e => {
        e.preventDefault();

        const file = foundImageInput?.files[0];

        const processItem = (imageData = null) => {
            const name = document.querySelector("#found-name")?.value || "";
            const category = document.querySelector("#found-category")?.value || "";
            const color = document.querySelector("#found-color")?.value || "";
            const location = document.querySelector("#found-location")?.value || "";

            const item = {
                id: generateId(),
                name,
                category,
                color,
                location,
                image: imageData,
                status: "found"
            };

            const items = getFoundItems();
            items.push(item);
            saveFoundItems(items);

            alert("Found item added!");
            foundForm.reset();
            if (foundPreview) foundPreview.style.display = "none";

            renderFoundItems();
            renderMatches();
        };

        if (file) convertImageToBase64(file, base64 => processItem(base64));
        else processItem();
    });
}

/* =========================
   RENDER FOUND ITEMS
========================= */

function renderFoundItems() {
    const container = document.querySelector("#found-items");
    if (!container) return;

    const items = getFoundItems();

    container.innerHTML = items.map(item => `
        <div class="card">
            ${item.image ? `<img src="${item.image}" style="width:100px;">` : ""}
            <h3>${item.name}</h3>
            <p>${item.category} • ${item.color}</p>
            <p>${item.location}</p>
            <p>Status: <b>${item.status || "found"}</b></p>
        </div>
    `).join("");
}

renderFoundItems();

/* =========================
   LOST HISTORY
========================= */

function renderLostHistory() {
    const container = document.querySelector("#lost-history");
    if (!container) return;

    const items = getLostItems();

    container.innerHTML = items.map(item => `
        <div class="card">
            ${item.image ? `<img src="${item.image}" style="width:100px;">` : ""}
            <h3>${item.name}</h3>
            <p>${item.category} • ${item.color}</p>
            <p>${item.location}</p>
        </div>
    `).join("");
}

renderLostHistory();

/* =========================
   FOUND HISTORY
========================= */

function renderFoundHistory() {
    const container = document.querySelector("#found-history");
    if (!container) return;

    const items = getFoundItems();

    container.innerHTML = items.map(item => `
        <div class="card">
            ${item.image ? `<img src="${item.image}" style="width:100px;">` : ""}
            <h3>${item.name}</h3>
            <p>${item.category} • ${item.color}</p>
            <p>${item.location}</p>
        </div>
    `).join("");
}

renderFoundHistory();

/* =========================
   PROFILE SYSTEM
========================= */

const saveProfileBtn = document.querySelector("#save-profile");

if (saveProfileBtn) {
    const profile = getProfile();

    document.querySelector("#profile-name").value = profile.name || "";
    document.querySelector("#profile-email").value = profile.email || "";
    document.querySelector("#profile-phone").value = profile.phone || "";
    document.querySelector("#profile-avatar").value = profile.avatar || "";

    saveProfileBtn.addEventListener("click", () => {
        const updatedProfile = {
            name: document.querySelector("#profile-name").value,
            email: document.querySelector("#profile-email").value,
            phone: document.querySelector("#profile-phone").value,
            avatar: document.querySelector("#profile-avatar").value
        };

        saveProfile(updatedProfile);
        alert("Profile saved!");
    });
}

/* =========================
   PASSWORD CHANGE
========================= */

const changePassBtn = document.querySelector("#change-pass-btn");

if (changePassBtn) {
    changePassBtn.addEventListener("click", () => {
        const newPass = document.querySelector("#new-pass").value;
        const confirmPass = document.querySelector("#confirm-pass").value;

        if (newPass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }

        localStorage.setItem("password", newPass);
        alert("Password updated!");
    });
}

/* =========================
   TEXT SIMILARITY ENGINE ⭐
========================= */

function similarity(a, b) {
    if (!a || !b) return 0;

    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a === b) return 1;

    if (a.includes(b) || b.includes(a)) return 0.8;

    const wordsA = a.split(" ");
    const wordsB = b.split(" ");

    let matches = 0;

    wordsA.forEach(word => {
        if (wordsB.includes(word)) matches++;
    });

    return matches / Math.max(wordsA.length, wordsB.length);
}

/* =========================
   FUZZY MATCH CALCULATION
========================= */

function calculateMatch(lost, found) {
    let score = 0;

    score += similarity(lost.category, found.category) * 40;
    score += similarity(lost.color, found.color) * 30;
    score += similarity(lost.location, found.location) * 30;

    return Math.round(score);
}

/* =========================
   RENDER MATCHES ⭐
========================= */

function renderMatches() {
    const container = document.querySelector("#matches-container");
    if (!container) return;

    const lostItems = getLostItems();
    const foundItems = getFoundItems();

    let html = "";

    lostItems.forEach(lost => {
        foundItems
            .filter(found => found.status !== "claimed")
            .forEach(found => {

                const matchPercent = calculateMatch(lost, found);

                if (matchPercent >= 50) {
                    html += `
                        <div class="card">
                            <h3>Possible Match (${matchPercent}%)</h3>

                            ${matchPercent >= 90 && found.image
                                ? `<img src="${found.image}" style="width:120px;">`
                                : `<div style="opacity:0.3">Image Hidden</div>`
                            }

                            <p><b>Lost:</b> ${lost.name}</p>
                            <p><b>Found:</b> ${found.name}</p>

                            <p>
                                ${similarity(lost.category, found.category) > 0.5 ? "✔ Similar Category<br>" : ""}
                                ${similarity(lost.color, found.color) > 0.5 ? "✔ Similar Color<br>" : ""}
                                ${similarity(lost.location, found.location) > 0.5 ? "✔ Similar Location<br>" : ""}
                            </p>

                            <button class="btn" onclick="openClaim('${lost.id}','${found.id}')">
                                Claim
                            </button>
                        </div>
                    `;
                }
            });
    });

    container.innerHTML = html || "<div class='card'>No matches yet</div>";
}

renderMatches();

/* =========================
   CLAIM SYSTEM
========================= */

function openClaim(lostId, foundId) {

    const modal = document.createElement("div");
    modal.className = "claim-modal";

    modal.innerHTML = `
        <div class="claim-box card">
            <h2>Claim Verification</h2>
            <input id="claim-proof" placeholder="Enter identifying detail"><br><br>
            <button class="btn" id="submit-claim">Submit Claim</button>
            <button class="btn" id="close-claim">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.querySelector("#close-claim").onclick = () => modal.remove();

    document.querySelector("#submit-claim").onclick = () => {
        const proof = document.querySelector("#claim-proof").value;

        if (!proof) {
            alert("Verification required!");
            return;
        }

        processClaim(lostId, foundId, proof);
        modal.remove();
    };
}

function processClaim(lostId, foundId, proof) {

    const claims = getClaims();
    const status = generateClaimStatus();

    const newClaim = {
        id: generateId(),
        lostId,
        foundId,
        proof,
        status,
        date: new Date().toLocaleString()
    };

    claims.push(newClaim);
    saveClaims(claims);

    if (status === "Approved") lockFoundItem(foundId);

    alert(`Claim submitted! Status: ${status}`);

    renderFoundItems();
    renderMatches();
}

function lockFoundItem(foundId) {

    const foundItems = getFoundItems();

    const updated = foundItems.map(item => {
        if (item.id === foundId) {
            return { ...item, status: "claimed" };
        }
        return item;
    });

    saveFoundItems(updated);
    renderMatches();
}

function generateClaimStatus() {
    const rand = Math.random();

    if (rand < 0.6) return "Pending";
    if (rand < 0.85) return "Approved";
    return "Rejected";
}
/* PROFILE DISPLAY */
const displayName = document.querySelector("#display-name");
const displayEmail = document.querySelector("#display-email");
const displayPhone = document.querySelector("#display-phone");
const displayPic = document.querySelector("#profile-pic");

if(displayName){
  const profile = getProfile();
  displayName.innerText = profile.name || "User";
  displayEmail.innerText = profile.email || "Email";
  displayPhone.innerText = profile.phone || "Phone";
  if(profile.avatar) displayPic.src = profile.avatar;
}
