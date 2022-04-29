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

async function build(threshold) {
  const result = [];
  const mGSL = await loadmGSL();
  const ipaDict = await loadCMUdictIPA();
  mGSL.slice(0, threshold).forEach((word) => {
    if (word in ipaDict) {
      result.push(`${word}\t${ipaDict[word]}`);
    } else {
      console.log(`error: ${word}`);
    }
  });
  return result;
}

const threshold = 10000;
const result = await build(threshold);
Deno.writeTextFileSync("src/pronounce.tsv", result.join("\n"));
