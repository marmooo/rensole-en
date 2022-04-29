words = {}
with open("words.lst", "w") as fout:
    count = 0
    with open("mGSL/dist/mGSL.lst") as fin:
        for line in fin:
            count += 1
            if count > 10000:
                break
            word = line.split("\t", 1)[0]
            words[word] = True
            fout.write(word + "\n")

with open("crawl-300d-2M-small.vec", "w") as fout:
    fout.write(str(len(words)) + " 300\n")
    with open("crawl-300d-2M.vec") as fin:
        for line in fin:
            word = line.split(" ", 1)[0]
            if word in words:
                fout.write(line)
