#!/usr/bin/env node

import {glob} from "node:fs/promises"
import {join} from "node:path"
import {
    getAllTests,
    runTests,
    formatTestResultsAsText,
    reportsFailure,
} from "@benchristel/taste"

main()

async function main() {
    const root = [import.meta.dirname, ".."]
    const testFilePatterns = [
        join(...root, "src", "**", "*.test.js"),
    ]

    for await (const path of glob(testFilePatterns)) {
        await import(path)
    }

    const results = await runTests(getAllTests())
        .then(formatTestResultsAsText)

    console.log(results)
    if (reportsFailure(results)) {
        process.exit(1)
    }
}
