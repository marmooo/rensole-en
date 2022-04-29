rm remote.db
rm -rf docs/db
cp crawl-300d-2M-small.magnitude remote.db
bash optimize.sh
mkdir -p docs/db
bash create_db.sh remote.db docs/db
