const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const plainText = document.getElementById("plainText");
const cipherText = document.getElementById("cipherText");

const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");

const shiftInput = document.getElementById("shiftInput");
const animationToggle = document.getElementById("animationToggle");

const wheel = document.getElementById("wheel");
const outerRing = document.getElementById("outerRing");
const innerRing = document.getElementById("innerRing");

let shift = 3;
let dragging = false;
let isAnimating = false;

let outerLetters = [];
let innerLetters = [];

function normalizeShift(value) {
  return ((Number(value) % 26) + 26) % 26;
}

function animationEnabled() {
  return animationToggle.checked;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function caesarChar(char, amount) {
  const upper = char.toUpperCase();

  if (!alphabet.includes(upper)) {
    return char;
  }

  const oldIndex = alphabet.indexOf(upper);
  const newIndex = normalizeShift(oldIndex + amount);
  const result = alphabet[newIndex];

  return (
    char === char.toLowerCase()
      ? result.toLowerCase()
      : result
  );
}

function polarPosition(size, radius, angleDeg) {
  const angleRad = angleDeg * Math.PI / 180;

  return {
    x: size / 2 + Math.sin(angleRad) * radius,
    y: size / 2 - Math.cos(angleRad) * radius
  };
}

function createLetter(parent, char, className, radius, angle, size) {
  const pos = polarPosition(size, radius, angle);

  const letter = document.createElement("div");
  letter.className = `letter ${className}`;
  letter.textContent = char;

  letter.style.left = `${pos.x}px`;
  letter.style.top = `${pos.y}px`;
  letter.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  parent.appendChild(letter);

  return letter;
}

function createDivider(parent, radiusInner, radiusOuter, angle, size) {
  const radiusMiddle = (radiusInner + radiusOuter) / 2;
  const length = radiusOuter - radiusInner;
  const pos = polarPosition(size, radiusMiddle, angle);

  const divider = document.createElement("div");
  divider.className = "dividerSegment";

  divider.style.height = `${length}px`;
  divider.style.left = `${pos.x}px`;
  divider.style.top = `${pos.y}px`;
  divider.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

  parent.appendChild(divider);
}

function createRingBorder(parent, radius) {
  const border = document.createElement("div");
  border.className = "ringBorder";

  border.style.width = `${radius * 2}px`;
  border.style.height = `${radius * 2}px`;

  parent.appendChild(border);
}

function createWheel() {
  outerRing.innerHTML = "";
  innerRing.innerHTML = "";

  outerLetters = [];
  innerLetters = [];

  const size = wheel.getBoundingClientRect().width;
  const step = 360 / 26;

  const outerOuterRadius = size * 0.50;
  const outerInnerRadius = size * 0.40;
  const outerLetterRadius = size * 0.455;

  const innerOuterRadius = size * 0.395;
  const innerInnerRadius = size * 0.25;
  const innerLetterRadius = size * 0.325;

  createRingBorder(outerRing, outerOuterRadius);
  createRingBorder(outerRing, outerInnerRadius);

  createRingBorder(innerRing, innerOuterRadius);
  createRingBorder(innerRing, innerInnerRadius);

  for (let i = 0; i < 26; i++) {
    const angle = i * step;
    const dividerAngle = angle - step / 2;

    createDivider(
      outerRing,
      outerInnerRadius,
      outerOuterRadius,
      dividerAngle,
      size
    );

    createDivider(
      innerRing,
      innerInnerRadius,
      innerOuterRadius,
      dividerAngle,
      size
    );

    outerLetters[i] = createLetter(
      outerRing,
      alphabet[i],
      "outerLetter",
      outerLetterRadius,
      angle,
      size
    );

    innerLetters[i] = createLetter(
      innerRing,
      alphabet[i],
      "innerLetter",
      innerLetterRadius,
      angle,
      size
    );
  }
}

function updateWheel() {
  shift = normalizeShift(shift);
  shiftInput.value = shift;

  const degrees = shift * (360 / 26);
  innerRing.style.transform = `rotate(${-degrees}deg)`;
}

function clearHighlights() {
  outerLetters.forEach(letter => {
    letter.classList.remove("clearHighlight");
  });

  innerLetters.forEach(letter => {
    letter.classList.remove("cipherHighlight");
  });
}

function highlightPair(clearIndex, cipherIndex) {
  clearHighlights();

  if (outerLetters[clearIndex]) {
    outerLetters[clearIndex].classList.add("clearHighlight");
  }

  if (innerLetters[cipherIndex]) {
    innerLetters[cipherIndex].classList.add("cipherHighlight");
  }
}

async function animate(encrypt = true) {
  if (isAnimating) return;

  isAnimating = true;
  clearHighlights();

  const input = encrypt
    ? plainText.value
    : cipherText.value;

  const outputField = encrypt
    ? cipherText
    : plainText;

  outputField.value = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const upper = char.toUpperCase();

    if (!alphabet.includes(upper)) {
      outputField.value += char;
      continue;
    }

    let clearIndex;
    let cipherIndex;

    if (encrypt) {
      clearIndex = alphabet.indexOf(upper);
      cipherIndex = normalizeShift(clearIndex + shift);
    } else {
      cipherIndex = alphabet.indexOf(upper);
      clearIndex = normalizeShift(cipherIndex - shift);
    }

    highlightPair(clearIndex, cipherIndex);

    outputField.value += encrypt
      ? caesarChar(char, shift)
      : caesarChar(char, -shift);

    if (animationEnabled()) {
      await sleep(1000);
    }
  }

  clearHighlights();
  isAnimating = false;
}

function setShiftFromPointer(event) {
  if (isAnimating) return;

  const rect = wheel.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const x = event.clientX - centerX;
  const y = event.clientY - centerY;

  let angle = Math.atan2(y, x) * 180 / Math.PI + 90;

  if (angle < 0) {
    angle += 360;
  }

  shift = Math.round(angle / (360 / 26));
  shift = normalizeShift(shift);

  updateWheel();
}

encryptBtn.addEventListener("click", () => {
  animate(true);
});

decryptBtn.addEventListener("click", () => {
  animate(false);
});

shiftInput.addEventListener("input", () => {
  if (isAnimating) return;

  shift = normalizeShift(shiftInput.value);
  updateWheel();
});

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && event.ctrlKey) {
    if (document.activeElement === cipherText) {
      animate(false);
    } else {
      animate(true);
    }
  }
});

innerRing.addEventListener("pointerdown", event => {
  if (isAnimating) return;

  dragging = true;
  innerRing.setPointerCapture(event.pointerId);
  setShiftFromPointer(event);
});

innerRing.addEventListener("pointermove", event => {
  if (!dragging) return;

  setShiftFromPointer(event);
});

innerRing.addEventListener("pointerup", () => {
  dragging = false;
});

innerRing.addEventListener("pointercancel", () => {
  dragging = false;
});

window.addEventListener("resize", () => {
  createWheel();
  updateWheel();
});

createWheel();
updateWheel();
