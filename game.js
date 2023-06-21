import { readLines } from "https://deno.land/std/io/mod.ts";

async function loadmGSL() {
  const dict = [];
  const fileReader = await Deno.open("mGSL/dist/mGSL.lst");
  for await (const line of readLines(fileReader)) {
    const word = line.split("\t", 1)[0];
    dict.push(word);
  }
  return dict;
}

async function loadCMUdictIPA() {
  const dict = {};
  const fileReader = await Deno.open("cmudict-ipa/cmudict.ipa");
  for await (const line of readLines(fileReader)) {
    const [word, ipa] = line.split("\t");
    dict[word] = ipa;
  }
  return dict;
}

async function build(grades, threshold) {
  const words = [];
  const poses = [];
  const mGSL = await loadmGSL();
  const ipaDict = await loadCMUdictIPA();
  let gradePos = 0;
  for (let i = 0; i < mGSL.length; i++) {
    if (i >= threshold) break;
    const word = mGSL[i];
    if (word.length == 1) continue;
    if (i >= grades[gradePos] - 1) {
      poses.push(words.length);
      gradePos += 1;
    }
    if (word in ipaDict) {
      words.push(`${word}\t${ipaDict[word]}`);
    } else {
      console.log(`error: ${word}`);
    }
  }
  return [words, poses];
}

const grades = [1000, 3000, 5000, 10000];
const threshold = 10000;
const [words, poses] = await build(grades, threshold);
const result = poses.join(",") + "\n" + words.join("\n");
Deno.writeTextFileSync("src/pronounce.tsv", result);
