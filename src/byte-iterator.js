export function byteIterator(readableStream) {
    return eachByte(readableStream)[Symbol.asyncIterator]()
}

export function byteIteratorFromArray(array) {
    return (async function*() {
        for (const byte of array) {
            yield byte
        }
    })()[Symbol.asyncIterator]()
}

export async function* eachByte(readableStream) {
    for await (const chunk of readableStream) {
        for (const byte of chunk) {
            yield byte
        }
    }        
}
