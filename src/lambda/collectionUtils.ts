/*!
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict'

import '../shared/utilities/asyncIteratorShim'

export function union<T>(a: Iterable<T>, b: Iterable<T>): Set<T> {
    const result = new Set<T>()

    for (const item of a) {
        result.add(item)
    }

    for (const item of b) {
        result.add(item)
    }

    return result
}

export function intersection<T>(sequence1: Iterable<T>, sequence2: Iterable<T>): Set<T> {
    const set2 = new Set(sequence2)

    return filter(sequence1, item => set2.has(item))
}

export function difference<T>(sequence1: Iterable<T>, sequence2: Iterable<T>): Set<T> {
    const set2 = new Set(sequence2)

    return filter(sequence1, item => !set2.has(item))
}

export function complement<T>(sequence1: Iterable<T>, sequence2: Iterable<T>): Set<T> {
    const set1 = new Set(sequence1)

    return filter(sequence2, item => !set1.has(item))
}

export async function toArrayAsync<T>(
    items: AsyncIterableIterator<T>,
    predicate?: (item: T) => boolean
): Promise<T[]> {
    const result: T[] = []

    for await (const item of items) {
        if (!predicate || predicate(item)) {
            result.push(item)
        }
    }

    return result
}

export function toMap<TKey, TValue>(
    items: Iterable<TValue>,
    keySelector: (item: TValue) => TKey | undefined
): Map<TKey, TValue> {
    const result = new Map<TKey, TValue>()

    for (const item of items) {
        const key = keySelector(item)
        if (!!key) {
            result.set(key, item)
        }
    }

    return result
}

export async function toMapAsync<TKey, TValue>(
    items: AsyncIterable<TValue>,
    keySelector: (item: TValue) => TKey | undefined
): Promise<Map<TKey, TValue>> {
    const result = new Map<TKey, TValue>()

    for await (const item of items) {
        const key = keySelector(item)
        if (!!key) {
            result.set(key, item)
        }
    }

    return result
}

export function updateInPlace<TKey, TValue>(
    target: Map<TKey, TValue>,
    keys: Iterable<TKey>,
    update: (key: TKey) => void,
    create: (key: TKey) => TValue
) {
    const keySet = new Set(keys)

    for (const key of difference(target.keys(), keySet)) {
        target.delete(key)
    }

    for (const key of target.keys()) {
        update(key)
    }

    for (const key of complement(target.keys(), keySet)) {
        target.set(key, create(key))
    }
}

function filter<T>(sequence: Iterable<T>, condition: (item: T) => boolean): Set<T> {
    const result = new Set<T>()

    for (const item of sequence) {
        if (condition(item)) {
            result.add(item)
        }
    }

    return result
}