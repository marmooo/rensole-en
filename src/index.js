import { escapeSql } from "https://deno.land/x/escape/mod.ts";
import { createDbWorker } from "../node_modules/sql.js-httpvfs/dist/index.js";

let correctAudio, incorrectAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("mp3/correct3.mp3"),
    loadAudio("mp3/incorrect1.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    correctAudio = audioBuffers[0];
    incorrectAudio = audioBuffers[1];
  });
}

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

async function getWordVector(lemma) {
  const result = await rensoleWorker.db.query(
    `SELECT * FROM magnitude WHERE key="${escapeSql(lemma)}"`,
  );
  if (result[0]) {
    const vector = new Array(300);
    for (const [k, v] of Object.entries(result[0])) {
      if (k.startsWith("dim_")) {
        const pos = parseInt(k.slice(4));
        vector[pos] = v;
      }
    }
    return vector;
  }
}

async function getSiminyms(lemma) {
  const row = await siminymWorker.db.query(
    `SELECT words FROM siminyms WHERE lemma="${escapeSql(lemma)}"`,
  );
  if (row[0]) {
    const words = JSON.parse(row[0].words);
    return words.reverse();
  } else {
    return [];
  }
}

function showHint(hint) {
  let html = "";
  if (Object.keys(hint).length == 0) return html;
  const n = (hint.type == "word") ? 1 : 3;
  const text = hint.text;
  for (let i = 0; i < text.length; i++) {
    if (text[i] == answer[i]) {
      html += `<span class="hint2">${text[i]}</span>`;
    } else {
      html += `<span class="hint${n}">${text[i]}</span>`;
    }
  }
  return html;
}

function getHint(replyCount) {
  let hint = "";
  switch (replyCount) {
    case 1:
      for (let i = 0; i < answer.length; i++) {
        hint += "?";
      }
      holedAnswer = hint;
      return { text: hint, type: "word" };
    case 3: {
      const arr = pronounce.split(" ");
      const poses = arr.map((str, i) => [str, i])
        .filter((x) => !/^[a-z]$/.test(x[0]))
        .map((x) => x[1]);
      const pos = poses[getRandomInt(0, poses.length)];
      holedPronounce = arr.map((x, i) => {
        return (i == pos) ? x : "?";
      });
      return { text: holedPronounce, type: "pronounce" };
    }
    case 5: {
      const pos = getRandomInt(0, answer.length);
      holedAnswer = holedAnswer.slice(0, pos) + answer[pos] +
        holedAnswer.slice(pos + 1);
      return { text: holedAnswer, type: "word" };
    }
    case 7: {
      const arr = pronounce.split(" ");
      const poses = arr.map((str, i) => [str, i])
        .filter((_, i) => holedPronounce[i] == "?")
        .filter((x) => !/^[a-z]$/.test(x[0]))
        .map((x) => x[1]);
      const pos = poses[getRandomInt(0, poses.length)];
      if (pos) holedPronounce[pos] = arr[pos];
      return { text: holedPronounce, type: "pronounce" };
    }
    case 9:
      if (answer.length > 3) {
        const poses = holedAnswer.split("")
          .map((str, i) => [str, i])
          .filter((x) => x[0] == "?")
          .map((x) => x[1]);
        const pos = poses[getRandomInt(0, poses.length)];
        holedAnswer = holedAnswer.slice(0, pos) + answer[pos] +
          holedAnswer.slice(pos + 1);
        return { text: holedAnswer, type: "word" };
      } else {
        return {};
      }
    default:
      return {};
  }
}

function showAnswer(cleared) {
  if (cleared) {
    playAudio(correctAudio);
  } else {
    playAudio(incorrectAudio);
  }
  document.getElementById("answer").classList.remove("d-none");
  const animations = [
    "bounce",
    "rubberBand",
    "flip",
    "rotateIn",
    "swing",
    "tada",
    "heartBeat",
    "jackInTheBox",
  ];
  const animation = animations[getRandomInt(0, animations.length)];
  const classNames = ["animate__animated", `animate__${animation}`];
  const answerText = document.getElementById("answerText");
  answerText.textContent = answer;
  answerText.parentNode.classList.add(...classNames);
  document.getElementById("restart").focus();
}

function search() {
  const searchText = document.getElementById("searchText");
  const word = searchText.value;
  getWordVector(word).then((b) => {
    if (b) {
      document.getElementById("notExisted").classList.add("invisible");
      if (replyCount >= 10) {
        if (word == answer) {
          showAnswer(true);
        } else {
          showAnswer(false);
        }
      } else {
        const a = answerVector;
        const similarity = math.dot(a, b) / (math.norm(a) * math.norm(b));
        const template = document.createElement("template");
        const m = mostSimilars[replyCount];
        const hint = getHint(replyCount);
        template.innerHTML = `
          <tr>
            <td>${word}</td><td>${similarity.toFixed(3)}</td>
            <td>${m[0]}</td><td>${m[1].toFixed(3)}</td>
            <td>${showHint(hint)}</td></td>
          </tr>
        `;
        const renso = document.getElementById("renso");
        const tr = template.content.firstElementChild;
        renso.insertBefore(tr, renso.firstChild);
        if (word == answer) showAnswer(true);
      }
      replyCount += 1;
    } else {
      document.getElementById("notExisted").classList.remove("invisible");
    }
    searchText.value = "";
  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function loadProblems() {
  await fetch("pronounce.tsv")
    .then((response) => response.text())
    .then((text) => {
      text.trimEnd().split("\n").forEach((line) => {
        vocabularies.push(line.split("\t"));
      });
      changeGrade();
    });
}

async function loadSiminymWorker(answer, grade) {
  if (!grade) {
    const obj = document.getElementById("grade");
    grade = obj.options[obj.selectedIndex].value;
  }
  const config = {
    from: "jsonconfig",
    configUrl: `/siminym-en/db/${grade}/config.json`,
  };
  siminymWorker = await createDbWorker(
    [config],
    "/siminym-en/sql.js-httpvfs/sqlite.worker.js",
    "/siminym-en/sql.js-httpvfs/sql-wasm.wasm",
  );
  mostSimilars = await getSiminyms(answer);
}

async function loadRensoWorker(answer) {
  const config = {
    from: "jsonconfig",
    configUrl: "/rensole-en/db/config.json",
  };
  rensoleWorker = await createDbWorker(
    [config],
    "/rensole-en/sql.js-httpvfs/sqlite.worker.js",
    "/rensole-en/sql.js-httpvfs/sql-wasm.wasm",
  );
  answerVector = await getWordVector(answer);
}

function restart() {
  const loading = document.getElementById("loading");
  loading.classList.remove("d-none");
  replyCount = 0;
  while (renso.firstChild) renso.firstChild.remove();
  const pos = getRandomInt(0, problems.length);
  answer = problems[pos][0];
  pronounce = problems[pos][1];
  document.getElementById("answer").classList.add("d-none");
  const promises = [
    getSiminyms(answer),
    getWordVector(answer),
  ];
  Promise.all(promises).then((result) => {
    mostSimilars = result[0];
    answerVector = result[1];
    document.getElementById("searchText").focus();
    loading.classList.add("d-none");
  });
}

function changeGrade() {
  const obj = document.getElementById("grade");
  const grade = obj.options[obj.selectedIndex].value;
  loadSiminymWorker(answer, grade);
  replyCount = 0;
  while (renso.firstChild) renso.firstChild.remove();
  problems = vocabularies.slice(0, parseInt(grade));
  const pos = getRandomInt(0, problems.length);
  answer = problems[pos][0];
  pronounce = problems[pos][1];
}

const vocabularies = [];
let problems = [];
let replyCount = 0;
let mostSimilars;
let answerVector;
let answer;
let pronounce;
let holedAnswer;
let holedPronounce;
let rensoleWorker;
let siminymWorker;
loadConfig();
loadProblems().then(() => {
  const loading = document.getElementById("loading");
  loading.classList.remove("d-none");
  loadSiminymWorker(answer);
  loadRensoWorker(answer);
  const renso = document.getElementById("renso");
  while (renso.firstChild) renso.firstChild.remove();
  loading.classList.add("d-none");
});

document.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    search();
  }
}, false);
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("search").onclick = search;
document.getElementById("restart").onclick = restart;
document.getElementById("grade").onchange = changeGrade;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
