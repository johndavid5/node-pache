set -x
node httpd.js 2>&1 | tee httpd.out
set +x
