#!/bin/bash

for h4cfile in data/*.h4c; do
    echo
    echo "$h4cfile"
    jsonfile="data/$(basename "$h4cfile" .h4c).json"
    if ! diff -u "$jsonfile" <(./prometheus "$h4cfile"); then
        fail=true
    fi
done

if [ "$fail" == true ]; then
    echo "Tests failed."
    exit 1
fi
