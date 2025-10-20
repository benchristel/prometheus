export async function readBoolean(bytes) {
    return Boolean(await readInt8(bytes))
}

export async function readInt8(bytes) {
    for await (const byte of read(bytes, 1)) {
        return byte
    }
}

export async function readInt16(bytes) {
    // Note: we assume ints are little-endian.
    let int = 0
    let shift = 0
    for await (const byte of read(bytes, 2)) {
        int |= byte << shift
        shift += 8
    }
    return int
}

export async function readBitmap(bytes) {
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

export async function readASCII(bytes, length) {
    let string = ""
    for await (const byte of read(bytes, length)) {
        string += String.fromCharCode(byte)
    }
    return string
}

export async function consume(bytes, numBytes, debug) {
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

