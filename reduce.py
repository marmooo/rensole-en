words = {}
with open("mGSL/dist/mGSL.lst") as f:
    for line in f:
        word = line.split("\t", 1)[0]
        words[word] = True

count = 0
with open("crawl-300d-2M.vec") as f:
    for line in f:
        word = line.split(" ", 1)[0]
        if word in words:
            count += 1

with open("crawl-300d-2M-small.vec", "w") as fout:
    fout.write(str(len(words)) + " 300\n")
    with open("crawl-300d-2M.vec") as fin:
        for line in fin:
            word = line.split(" ", 1)[0]
            if word in words:
                fout.write(line)
