:; node "$(dirname "$0")/index.js" "$@"; exit $?
@ECHO OFF
node "%~dp0index.js" %*
