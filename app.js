const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const plainText = document.getElementById("plainText");
const cipherText = document.getElementById("cipherText");
const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const shiftInput = document.getElementById("shiftInput");

const wheel = document.getElementById("wheel");
const outerRing = document.getElementById("outerRing");
const innerRing = document.getElementById("innerRing");

let shift = 3;
let dragging = false;

function normalizeShift(value) {
  return ((Number(value) % 26) + 26) % 26;
}

function caesar(text, amount) {
  return text.replace(/[a-zäöüA-ZÄÖÜ]/g, char => {
    const upper = char.toUpperCase();

    if (!alphabet.includes(upper)) return char;

    const oldIndex = alphabet.indexOf(upper);
    const newIndex = normalizeShift(oldIndex + amount);
    const result = alphabet[newIndex];

    return char === char.toLowerCase() ? result.toLowerCase() : result;
  });
}

function createWheelLetters() {
  outerRing.innerHTML = "";
  innerRing.innerHTML = "";

  for (let i = 0; i < 26; i++) {
    const angle = i * (360 / 26);

    const outerLetter = document.createElement("div");
    outerLetter.className = "letter outerLetter";
    outerLetter.textContent = alphabet[i];
    outerLetter.style.transform =
      `rotate(${angle}deg) translateY(-183px) rotate(${-angle}deg) translate(-50%, -50%)`;
    outerRing.appendChild(outerLetter);

    const innerLetter = document.createElement("div");
    innerLetter.className = "letter innerLetter";
    innerLetter.textContent = alphabet[i];
    innerLetter.style.transform =
      `rotate(${angle}deg) translateY(-134px) rotate(${-angle}deg) translate(-50%, -50%)`;
    innerRing.appendChild(innerLetter);

    const outerDivider = document.createElement("div");
    outerDivider.className = "divider";
    outerDivider.style.transform = `rotate(${angle - 180 / 26}deg)`;
    outerRing.appendChild(outerDivider);

    const innerDivider = document.createElement("div");
    innerDivider.className = "divider innerDivider";
    innerDivider.style.transform = `rotate(${angle - 180 / 26}deg)`;
    innerRing.appendChild(innerDivider);
  }
}

function updateWheel() {
  shift = normalizeShift(shift);
  shiftInput.value = shift;
  const degrees = shift * (360 / 26);
  innerRing.style.transform = `rotate(${degrees}deg)`;
}

function setShiftFromPointer(event) {
  const rect = wheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const x = event.clientX - centerX;
  const y = event.clientY - centerY;

  let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;

  shift = Math.round(angle / (360 / 26)) % 26;
  updateWheel();
}

encryptBtn.addEventListener("click", () => {
  cipherText.value = caesar(plainText.value, shift);
});

decryptBtn.addEventListener("click", () => {
  plainText.value = caesar(cipherText.value, -shift);
});

shiftInput.addEventListener("input", () => {
  shift = normalizeShift(shiftInput.value);
  updateWheel();
});

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && event.ctrlKey) {
    if (document.activeElement === cipherText) {
      plainText.value = caesar(cipherText.value, -shift);
    } else {
      cipherText.value = caesar(plainText.value, shift);
    }
  }
});

innerRing.addEventListener("pointerdown", event => {
  dragging = true;
  innerRing.setPointerCapture(event.pointerId);
  setShiftFromPointer(event);
});

innerRing.addEventListener("pointermove", event => {
  if (dragging) setShiftFromPointer(event);
});

innerRing.addEventListener("pointerup", () => {
  dragging = false;
});

innerRing.addEventListener("pointercancel", () => {
  dragging = false;
});

createWheelLetters();
updateWheel();
