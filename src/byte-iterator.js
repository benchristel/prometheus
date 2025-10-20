export function byteIterator(readableStream) {
    return eachByte(readableStream)[Symbol.asyncIterator]()
}

async function* eachByte(readableStream) {
    for await (const chunk of readableStream) {
        for (const byte of chunk) {
            yield byte
        }
    }        
}
