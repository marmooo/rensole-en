# Rensole-en

[A word association game using similarity between words](https://marmooo.github.io/rensole-en/).

## Requirements

- [rye](https://github.com/mitsuhiko/rye)
- `sudo apt install clang libstdc++-12-dev` for
  [spotify/annoy](https://github.com/spotify/annoy)

## Installation

- install [marmooo/mGSL](https://github.com/marmooo/mgsl) licensed under the
  [CC BY-SA-4.0](http://creativecommons.org/licenses/by-sa/4.0/)
- install
  [crawl-300d-2M.vec.zip](https://dl.fbaipublicfiles.com/fasttext/vectors-english/crawl-300d-2M.vec.zip)
  from [fastText](https://fasttext.cc/docs/en/crawl-vectors.html) licensed under
  the [CC-BY-SA-3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- install [marmooo/siminym-ja](https://github.com/marmooo/siminym-ja) licensed
  under the [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- `rye sync`

## Build

```
bash build-dict.sh
bash build-db.sh
bash build.sh
```

## Related projects

- [Rensole-ja](https://github.com/marmooo/rensole-ja) (Japanese)
- [Rensole-zh](https://github.com/marmooo/rensole-zh) (Chinese)

## License

CC-BY-SA-4.0
