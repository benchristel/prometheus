#!/usr/bin/env node

main()

async function main() {
    const output = {}

    const bytes = byteIterator(process.stdin)
    
    await consume(bytes, 11)
    output.players = await readPlayers(bytes)
    output.mapName = await readMapName(bytes)
    
    console.log(JSON.stringify(output, null, 4))
}

async function readPlayers(bytes) {
    const length = await readInt8(bytes)
    const players = new Array(length)
    for (let i = 0; i < length; i++) {
        players[i] = await readPlayer(bytes)
    }
    return players
}

async function readPlayer(bytes) {
    const player = {}
    player.color = await readPlayerColor(bytes)
    await consume(bytes, 3)
    player.availableAlignments = await readPlayerAlignments(bytes)
    return player
}

async function readPlayerColor(bytes) {
    const code = await readInt8(bytes)
    switch (code) {
        case 0: return "red"
        case 1: return "blue"
        case 2: return "green"
        case 3: return "orange"
        case 4: return "purple"
        case 5: return "teal"
    }
}

async function readPlayerAlignments(bytes) {
    const bits = await readBitmap(bytes)
    const alignments = {}
    if (bits[0]) alignments.life = true
    if (bits[1]) alignments.order = true
    if (bits[2]) alignments.death = true
    if (bits[3]) alignments.chaos = true
    if (bits[4]) alignments.nature = true
    if (bits[5]) alignments.might = true
    return alignments
}

async function readMapName(bytes) {
    const length = await readInt16(bytes)
    return await readASCII(bytes, length)
}

async function readInt8(bytes) {
    for await (const byte of read(bytes, 1)) {
        return byte
    }
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

async function readBitmap(bytes) {
    const byte = await readInt8(bytes)
    return [
        byte & 0b0000_0001,
        byte & 0b0000_0010,
        byte & 0b0000_0100,
        byte & 0b0000_1000,
        byte & 0b0001_0000,
        byte & 0b0010_0000,
        byte & 0b0100_0000,
        byte & 0b1000_0000,
    ]
}

async function readASCII(bytes, length) {
    let string = ""
    for await (const byte of read(bytes, length)) {
        string += String.fromCharCode(byte)
    }
    return string
}

async function consume(bytes, numBytes, debug) {
    if (debug) console.log(`consume: ${numBytes}`)
    for await (const byte of read(bytes, numBytes)) {
        if (debug) console.log(byte)
    }
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
