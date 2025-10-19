#!/usr/bin/env node

main()

async function main() {
    const output = {}

    const bytes = byteIterator(process.stdin)
    
    await readHeader(bytes)
    output.mapName = await readMapName(bytes)
    
    console.log(JSON.stringify(output, null, 4))
}

async function readHeader(bytes) {
    await consume(bytes, 12)
}

async function readMapName(bytes) {
    const length = await readInt16(bytes)
    return await readASCII(bytes, length)
}

async function readInt16(bytes) {
    // Note: we assume ints are little-endian.
    let int = 0
    let shift = 0
    for await (const byte of read(bytes, 2)) {
        int |= byte << shift
        shift += 8
    }
    return int
}

async function readASCII(bytes, length) {
    let string = ""
    for await (const byte of read(bytes, length)) {
        string += String.fromCharCode(byte)
    }
    return string
}

async function consume(bytes, numBytes) {
    for await (const _ of read(bytes, numBytes)) {}
}

async function* read(bytes, numBytes) {
    for (let read = 0; read < numBytes; read++) {
        const {value: byte, done} = await bytes.next()
        if (done) throw Error(`Unexpected end of byte stream`)
        yield byte
    }
}

function byteIterator(readableStream) {
    return eachByte(readableStream)[Symbol.asyncIterator]()
}

async function* eachByte(readableStream) {
    for await (const chunk of readableStream) {
        for (const byte of chunk) {
            yield byte
        }
    }        
}
