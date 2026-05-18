const STORAGE_KEY = "numberRelayState";

const numberInput = document.querySelector("#numberInput");
const fileInput = document.querySelector("#fileInput");
const saveListButton = document.querySelector("#saveListButton");
const resetProgressButton = document.querySelector("#resetProgressButton");
const nextButton = document.querySelector("#nextButton");
const currentNumber = document.querySelector("#currentNumber");
const progressText = document.querySelector("#progressText");
const remainingText = document.querySelector("#remainingText");
const progressFill = document.querySelector("#progressFill");
const saveStatus = document.querySelector("#saveStatus");

let state = {
  numbers: [],
  index: 0
};

function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (savedState && Array.isArray(savedState.numbers)) {
      state = {
        numbers: savedState.numbers.map(String),
        index: Number.isInteger(savedState.index) ? savedState.index : 0
      };
    }
  } catch {
    state = { numbers: [], index: 0 };
  }

  clampIndex();
  numberInput.value = state.numbers.join(", ");
  render();
}

function saveState(message = "Saved locally", isError = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveStatus.textContent = message;
  saveStatus.classList.toggle("is-error", isError);
}

function parseNumbers(input) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => !Number.isNaN(Number(item)));
}

function clampIndex() {
  if (state.index < 0) {
    state.index = 0;
  }

  if (state.index > state.numbers.length) {
    state.index = state.numbers.length;
  }
}

function render() {
  const total = state.numbers.length;
  const shown = Math.min(state.index, total);
  const remaining = Math.max(total - shown, 0);
  const progress = total === 0 ? 0 : (shown / total) * 100;

  if (total === 0) {
    currentNumber.textContent = "No list";
  } else if (shown === 0) {
    currentNumber.textContent = "Ready";
  } else {
    currentNumber.textContent = state.numbers[shown - 1];
  }

  nextButton.disabled = total === 0 || state.index >= total;
  progressText.textContent = `${shown} of ${total} shown`;
  remainingText.textContent = `${remaining} left`;
  progressFill.style.width = `${progress}%`;
}

function saveNewList() {
  const parsedNumbers = parseNumbers(numberInput.value);

  if (parsedNumbers.length === 0) {
    saveState("Enter numbers first", true);
    return;
  }

  state = {
    numbers: parsedNumbers,
    index: 0
  };

  saveState(`${parsedNumbers.length} numbers saved`);
  render();
}

function showNextNumber() {
  if (state.index >= state.numbers.length) {
    return;
  }

  state.index += 1;
  saveState("Progress saved");
  render();
}

function resetProgress() {
  state.index = 0;
  saveState("Progress reset");
  render();
}

function uploadTextFile() {
  const file = fileInput.files[0];

  if (!file) {
    return;
  }

  const isTextFile = file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain";

  if (!isTextFile) {
    saveState("Use a .txt file", true);
    fileInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    numberInput.value = String(reader.result || "");
    saveNewList();
    fileInput.value = "";
  });

  reader.addEventListener("error", () => {
    saveState("File could not be read", true);
    fileInput.value = "";
  });

  reader.readAsText(file);
}

saveListButton.addEventListener("click", saveNewList);
fileInput.addEventListener("change", uploadTextFile);
nextButton.addEventListener("click", showNextNumber);
resetProgressButton.addEventListener("click", resetProgress);

loadState();
