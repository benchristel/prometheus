#!/usr/bin/env node

import {byteIterator} from "./byte-iterator.js"
import {
    consume,
    readInt8,
    readInt16,
    readBitmap,
    readASCII,
} from "./primitives.js"

main()

async function main() {
    const output = {
        mapName: "",
        mapDescription: "",
        carryoverDescription: "",
        initialVictoryConditionDescription: "",
        initialLossConditionDescription: "",
        prologue: null,
        epilogue: null,
        players: [],
        playerDetails: [],
    }

    const bytes = byteIterator(process.stdin)
    
    await consume(bytes, 11)
    output.players = await readPlayers(bytes)
    output.mapName = await readString(bytes)
    await consume(bytes, 1)
    output.mapDescription = await readString(bytes)
    await consume(bytes, 2)
    const mysteryLength = await readInt8(bytes)
    await consume(bytes, mysteryLength)
    output.initialLossConditionDescription
        = await readInitialLossConditionDescription(bytes)
    output.initialVictoryConditionDescription
        = await readInitialVictoryConditionDescription(bytes)
    await consume(bytes, 1)
    output.prologue = await readExposition(bytes)
    output.epilogue = await readExposition(bytes)
    output.carryoverDescription = await readString(bytes)
    await consume(bytes, 9)
    await consume(bytes, 60)
    output.playerDetails = await readPlayerDetails(bytes, output.players.length)
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
    player.canBeHuman = Boolean(await readInt8(bytes))
    await consume(bytes, 2)
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

const readInitialVictoryConditionDescription = readInitialLossConditionDescription
async function readInitialLossConditionDescription(bytes) {
    if (await readInt8(bytes)) {
        return await readString(bytes)
    } else {
        return null
    }
}

// Reads a prologue or epilogue
async function readExposition(bytes) {
    if (await readInt8(bytes)) {
        const exposition = {
            message: "",
            image: "",
            voiceOver: "",
        }
        await consume(bytes, 2)
        exposition.message = await readString(bytes)
        exposition.image = await readString(bytes)
        exposition.voiceOver = await readString(bytes)
        return exposition
    } else {
        return null
    }
}

async function readString(bytes) {
    const length = await readInt16(bytes)
    return await readASCII(bytes, length)
}

async function readPlayerDetails(bytes, numPlayers) {
    const playerDetails = new Array(numPlayers)
    for (let i = 0; i < numPlayers; i++) {
        playerDetails[i] = await readPlayerDetail(bytes)
    }
    return playerDetails
}

async function readPlayerDetail(bytes) {
    const detail = {
        maxLevel: null
    }
    await consume(bytes, 1)
    const hasMaxLevel = Boolean(await readInt8(bytes))
    if (hasMaxLevel) {
        detail.maxLevel = await readInt16(bytes)
    }
    await consume(bytes, 1)
    return detail
}
