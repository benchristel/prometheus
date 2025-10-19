#!/usr/bin/env node

main()

const output = {}

async function main() {
    const bytes = byteIterator(process.stdin)
    
    await readHeader(bytes)
    await readMapName(bytes)
    
    console.log(JSON.stringify(output, null, 4))
}

async function readHeader(bytes) {
    for (let read = 0; read < 12; read++) {
        const {done, value} = await bytes.next()
        console.log(value)
        if (done) throw Error("readHeader: unexpected end of byte stream")
    }
}

async function readMapName(bytes) {
    const length = await readInt16(bytes)
    output.mapName = await readASCII(bytes, length)
}

async function readInt16(bytes) {
    let int = 0
    for (let read = 0; read < 2; read++) {
        const {value: byte, done} = await bytes.next()
        if (done) throw Error("readInt16: unexpected end of byte stream")
        int |= byte << (read * 8)
    }
    return int
}

async function readASCII(bytes, length) {
    let string = ""
    for (let read = 0; read < length; read++) {
        const {value: byte, done} = await bytes.next()
        if (done) throw Error("readASCII: unexpected end of byte stream")
        string += String.fromCharCode(byte)
    }
    return string
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
