import {test, expect, is, equals} from "@benchristel/taste"
import {byteIteratorFromArray} from "./byte-iterator.js"
import {readInt8, readInt16} from "./primitives.js"

test("readInt8", {
    async "reads zero"() {
        const bytes = byteIteratorFromArray([0])
        expect(await readInt8(bytes), is, 0)
    },

    async "reads 255"() {
        const bytes = byteIteratorFromArray([255])
        expect(await readInt8(bytes), is, 255)
    },

    async "throws an error if there are no bytes to read"() {
        const bytes = byteIteratorFromArray([])
        expect(
            await errorFromAsync(() => readInt8(bytes)),
            equals,
            Error("Unexpected end of byte stream"),
        )
    }
})

test("readInt16", {
    async "reads zero"() {
        const bytes = byteIteratorFromArray([0, 0])
        expect(await readInt16(bytes), is, 0)
    },

    async "assumes little-endian format"() {
        const bytes = byteIteratorFromArray([1, 2])
        expect(await readInt16(bytes), is, 513)
    },

    async "throws an error if there aren't two bytes to read"() {
        const bytes = byteIteratorFromArray([1])
        expect(
            await errorFromAsync(() => readInt16(bytes)),
            equals,
            Error("Unexpected end of byte stream"),
        )
    },
})

async function errorFromAsync(f) {
    try {
        await f()
    } catch (e) {
        return e
    }
}
