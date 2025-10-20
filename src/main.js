#!/usr/bin/env node

import {byteIterator} from "./byte-iterator.js"
import {
    consume,
    readBoolean,
    readInt8,
    readInt16,
    readBitmap,
    readString,
} from "./primitives.js"

main()

async function main() {
    const output = {
        mapSize: 0,
        numMapLevels: 0,
        mapName: "",
        mapDescription: "",
        carryoverDescription: "",
        intendedForMultiplayer: false,
        initialVictoryConditionDescription: "",
        initialLossConditionDescription: "",
        prologue: null,
        epilogue: null,
        players: [],
        playerDetails: [],
    }

    const bytes = byteIterator(process.stdin)

    const header = await readHeader(bytes)
    output.mapSize = header.mapSize
    output.numMapLevels = header.numMapLevels
    
    output.players = await readPlayers(bytes)
    output.mapName = await readString(bytes)
    await consume(bytes, 1)
    output.mapDescription = await readString(bytes)
    await consume(bytes, 2)
    const mysteryLength2 = await readInt8(bytes)
    await consume(bytes, mysteryLength2)
    output.initialLossConditionDescription
        = await readInitialLossConditionDescription(bytes)
    output.initialVictoryConditionDescription
        = await readInitialVictoryConditionDescription(bytes)
    await consume(bytes, 1)
    output.prologue = await readExposition(bytes)
    output.epilogue = await readExposition(bytes)
    output.carryoverDescription = await readString(bytes)
    output.intendedForMultiplayer = await readBoolean(bytes)
    await consume(bytes, 8)
    await consume(bytes, 60)
    output.playerDetails = await readPlayerDetails(bytes, output.players.length)
    console.log(JSON.stringify(output, null, 4))
}

async function readHeader(bytes) {
    const header = {}
    // I'm not sure if this is an int16 or an int8 followed by something else.
    // Assuming it's an int16, the second (high) byte is 0 in all the maps I
    // have.
    const code = await readInt16(bytes)
    switch (code) {
        case 0x1b:
            header.mapSize = await readInt16(bytes)
            header.numMapLevels = await readInt8(bytes)
            await consume(bytes, 4)
            break;
        case 0x1c:
        case 0x1d:
            // I think the first of these 2 bytes might indicate which
            // expansions are required to play the map, but I'm not sure.
            await consume(bytes, 2)
            header.mapSize = await readInt16(bytes)
            header.numMapLevels = await readInt8(bytes)
            await consume(bytes, 4)
            break;
        default:
            throw Error(`Unexpected header code 0x${code.toString(16)}`)
    }
    return header;
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
