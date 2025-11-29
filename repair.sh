#!/bin/bash

cat "$1" | gunzip | src/repair.js | gzip
