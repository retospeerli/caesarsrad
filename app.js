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


/* ======================================================
   Hilfsfunktionen
====================================================== */

function normalizeShift(value) {
  return ((Number(value) % 26) + 26) % 26;
}


function caesar(text, amount) {

  return text.replace(/[A-Za-zÄÖÜäöü]/g, char => {

    const upper = char.toUpperCase();

    if (!alphabet.includes(upper)) {
      return char;
    }

    const oldIndex = alphabet.indexOf(upper);

    const newIndex =
      normalizeShift(oldIndex + amount);

    const result =
      alphabet[newIndex];

    if (char === char.toLowerCase()) {
      return result.toLowerCase();
    }

    return result;
  });
}


/* ======================================================
   Buchstaben auf beide Ringe zeichnen
====================================================== */

function createWheelLetters() {

  outerRing.innerHTML = "";
  innerRing.innerHTML = "";

  const step = 360 / 26;


  for (let i = 0; i < 26; i++) {

    const angle = i * step;


    /* -----------------------------------------
       ÄUSSERER RING
    ----------------------------------------- */

    const outerLetter =
      document.createElement("div");

    outerLetter.className =
      "letter outerLetter";

    outerLetter.textContent =
      alphabet[i];

    /*
       WICHTIG:

       rotate(angle)
       -> an Position drehen

       translateY()
       -> nach aussen setzen

       rotate(180deg)
       -> Unterkante zeigt zur Mitte
    */

    outerLetter.style.transform =
      `rotate(${angle}deg)
       translateY(-183px)
       rotate(180deg)
       translate(-50%, -50%)`;

    outerRing.appendChild(
      outerLetter
    );


    /* Trennlinie */

    const outerDivider =
      document.createElement("div");

    outerDivider.className =
      "divider";

    outerDivider.style.transform =
      `rotate(${angle - step/2}deg)`;

    outerRing.appendChild(
      outerDivider
    );



    /* -----------------------------------------
       INNERER RING
    ----------------------------------------- */

    const innerLetter =
      document.createElement("div");

    innerLetter.className =
      "letter innerLetter";

    innerLetter.textContent =
      alphabet[i];

    innerLetter.style.transform =
      `rotate(${angle}deg)
       translateY(-134px)
       rotate(180deg)
       translate(-50%, -50%)`;

    innerRing.appendChild(
      innerLetter
    );


    /* Trennlinie */

    const innerDivider =
      document.createElement("div");

    innerDivider.className =
      "divider innerDivider";

    innerDivider.style.transform =
      `rotate(${angle - step/2}deg)`;

    innerRing.appendChild(
      innerDivider
    );
  }
}



/* ======================================================
   Drehscheibe aktualisieren
====================================================== */

function updateWheel() {

  shift =
    normalizeShift(shift);

  shiftInput.value =
    shift;

  const degrees =
    shift * (360 / 26);

  innerRing.style.transform =
    `rotate(${degrees}deg)`;
}



/* ======================================================
   Mausposition in Verschiebung umrechnen
====================================================== */

function setShiftFromPointer(event) {

  const rect =
    wheel.getBoundingClientRect();

  const centerX =
    rect.left + rect.width / 2;

  const centerY =
    rect.top + rect.height / 2;


  const x =
    event.clientX - centerX;

  const y =
    event.clientY - centerY;


  let angle =
    Math.atan2(y, x) *
    180 / Math.PI + 90;


  if (angle < 0) {
    angle += 360;
  }


  shift =
    Math.round(
      angle / (360 / 26)
    ) % 26;


  updateWheel();
}



/* ======================================================
   Verschlüsseln
====================================================== */

function encrypt() {

  cipherText.value =
    caesar(
      plainText.value,
      shift
    );
}



/* ======================================================
   Entschlüsseln
====================================================== */

function decrypt() {

  plainText.value =
    caesar(
      cipherText.value,
      -shift
    );
}



/* ======================================================
   Buttons
====================================================== */

encryptBtn.addEventListener(
  "click",
  encrypt
);


decryptBtn.addEventListener(
  "click",
  decrypt
);




/* ======================================================
   Shift-Feld
====================================================== */

shiftInput.addEventListener(
  "input",
  () => {

    shift =
      normalizeShift(
        shiftInput.value
      );

    updateWheel();
  }
);




/* ======================================================
   Enter / Ctrl+Enter
====================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
      &&
      event.ctrlKey
    ) {

      if (
        document.activeElement
        === cipherText
      ) {
        decrypt();
      }

      else {
        encrypt();
      }
    }
  }
);




/* ======================================================
   Dragging
====================================================== */

innerRing.addEventListener(
  "pointerdown",
  event => {

    dragging = true;

    innerRing.setPointerCapture(
      event.pointerId
    );

    setShiftFromPointer(
      event
    );
  }
);



innerRing.addEventListener(
  "pointermove",
  event => {

    if (!dragging) {
      return;
    }

    setShiftFromPointer(
      event
    );
  }
);



innerRing.addEventListener(
  "pointerup",
  () => {

    dragging = false;
  }
);



innerRing.addEventListener(
  "pointercancel",
  () => {

    dragging = false;
  }
);




/* ======================================================
   Start
====================================================== */

createWheelLetters();

updateWheel();
