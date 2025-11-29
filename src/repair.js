#!/usr/bin/env node
import {eachByte} from "./byte-iterator.js"

const byteIter = eachByte(process.stdin)

const bytes = []

for await (const byte of byteIter) {
    bytes.push(byte)
}

const townWallBytes = [..."Town Wall"].map((c) => c.charCodeAt(0))

let replaced = 0;

bytesOfSaveFile:
for (let i = 0; i < bytes.length; i++) {
    for (let k = 0; k < townWallBytes.length; k++) {
        if (bytes[i + k] !== townWallBytes[k]) {
            continue bytesOfSaveFile;
        }
    }
    bytes[i + townWallBytes.length - 1] = 48 + (replaced++ % 10)
}

const bytesAsTypedArray = new Uint8Array(bytes.length)
for (let i = 0; i < bytes.length; i++) {
    bytesAsTypedArray[i] = bytes[i]
}

process.stdout.write(bytesAsTypedArray)
