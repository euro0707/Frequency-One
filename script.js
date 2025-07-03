const receiveBtn = document.getElementById("receiveBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const codeEl = document.getElementById("code");
const messageEl = document.getElementById("message");
const shareBtn = document.getElementById("shareBtn");

const STORAGE_KEY = "frequencyOne_today";

function playSound(src) {
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 1;
  audio.currentTime = 0;
  audio.play().catch((e) => console.warn("Audio play blocked:", e));
}

function getTodayKey() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${STORAGE_KEY}_${today}`;
}

function showResult(item) {
  codeEl.textContent = item.code;
  messageEl.textContent = item.message;
  // Change background based on color
  let color;
  switch (item.color) {
    case "紫":
      color = "#4b0082";
      break;
    case "青":
      color = "#003366";
      break;
    case "金":
      color = "#d4af37";
      break;
    case "黒":
      color = "#000000";
      break;
    default:
      color = "#333";
  }
  // fade to target color
  document.body.style.background = color;
  playSound(item.sound);

  // Prepare share link
  const text = encodeURIComponent(`${item.code}: ${item.message} #FrequencyOne`);
  shareBtn.onclick = () => {
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  resultEl.classList.remove("hidden");
}

async function fetchMessages() {
  const resp = await fetch("messages.json");
  return resp.json();
}

async function getRandomMessage() {
  const data = await fetchMessages();
  return data[Math.floor(Math.random() * data.length)];
}

function hideResult() {
  resultEl.classList.add("hidden");
  codeEl.textContent = "";
  messageEl.textContent = "";
}

receiveBtn.addEventListener("click", async () => {
  receiveBtn.disabled = true;
  hideResult();
  statusEl.classList.remove("hidden");
  // set initial black background for fade effect
  document.body.style.background = "#000000";
  playSound("sound/hadou_chime.mp3");

  setTimeout(async () => {
    statusEl.classList.add("hidden");
    const stored = localStorage.getItem(getTodayKey());
    let item;
    if (stored) {
      item = JSON.parse(stored);
    } else {
      item = await getRandomMessage();
      localStorage.setItem(getTodayKey(), JSON.stringify(item));
    }
    showResult(item);
    receiveBtn.disabled = false;
  }, 2000);
});

// Auto-show if already stored today
const todayStored = localStorage.getItem(getTodayKey());
if (todayStored) {
  showResult(JSON.parse(todayStored));
}
