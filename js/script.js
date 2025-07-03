const receiveBtn = document.getElementById("receiveBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const codeEl = document.getElementById("code");
const messageEl = document.getElementById("message");
const shareBtn = document.getElementById("shareBtn");
const letterEl = document.getElementById("letter");

function animateLetter() {
  if (!letterEl) return;
  letterEl.classList.remove("hidden");
  letterEl.classList.add("fly-in");
  setTimeout(() => {
    letterEl.classList.add("hidden");
    letterEl.classList.remove("fly-in");
  }, 1800);
}

const STORAGE_KEY = "frequencyOne_today";

function playSound(src) {
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 1;
  audio.currentTime = 0;
  audio.play().catch((e) => {
    console.warn("🔇 Audio play failed:", src, e);
  });
}

function getTodayKey() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${STORAGE_KEY}_${today}`;
}

function showResult(item, playAudio = true) {
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
  if (playAudio) {
    playSound(item.sound);
  }

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
  // play flying letter animation immediately
  animateLetter();
  const noticeEl = document.getElementById("notice");
  const stored = localStorage.getItem(getTodayKey());

  if (stored) {
    // already have today's message
    hideResult();
    noticeEl.classList.remove("hidden");
    playSound("sound/hadou_chime.mp3");
    return;
  }

  // hide notice if first time today
  noticeEl.classList.add("hidden");
  receiveBtn.disabled = true;
  hideResult();
  statusEl.classList.remove("hidden");
  // set initial black background for fade effect
  document.body.style.background = "#000000";
  playSound("sound/hadou_chime.mp3");

  // ユーザー操作から 2 秒後にメッセージ表示と個別サウンド再生
  setTimeout(async () => {
    const item = await getRandomMessage();
    localStorage.setItem(getTodayKey(), JSON.stringify(item));
    statusEl.classList.add("hidden");
    showResult(item); // showResult 内で item.sound を再生
    receiveBtn.disabled = false;
  }, 2000);
});

// Auto-show if already stored today
const todayStored = localStorage.getItem(getTodayKey());
if (todayStored) {
  showResult(JSON.parse(todayStored), false);
}
