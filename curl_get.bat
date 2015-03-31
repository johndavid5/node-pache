REM curl -v --noproxy localhost http:/localhost:8081/
curl -v --noproxy "localhost" "http:/localhost:8081/shemp" 2>&1 | tee curl_get.out
REM curl -v --noproxy localhost http:/localhost:8081/curly-joe
