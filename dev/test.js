#!/usr/bin/env node
import {getAllTests, runTests, formatTestResultsAsText} from "@benchristel/taste"

runTests(getAllTests())
    .then(formatTestResultsAsText)
    .then(console.log)
