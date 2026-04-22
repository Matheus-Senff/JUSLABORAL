/**
 * Calcula a distância de Levenshtein entre duas strings
 * (número de operações necessárias para transformar uma string em outra)
 * 
 * Eu implementei isso aqui pra fazer busca fuzzy - meio complexo mas funciona
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

    if (s1 === s2) return 0
    if (s1.length === 0) return s2.length
    if (s2.length === 0) return s1.length

    // TODO: otimizar isso depois com algoritmo melhor
    const matrix: number[][] = Array(s2.length + 1)
        .fill(null)
        .map(() => Array(s1.length + 1).fill(0))

    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            )
        }
    }

    return matrix[s2.length][s1.length]
}

/**
 * Busca fuzzy em um array de strings
 * Retorna resultados ordenados por relevância
 */
export const fuzzySearch = <T>(
    query: string,
    items: T[],
    getDisplayValue: (item: T) => string,
    maxResults: number = 10,
    maxDistance: number = 3
): T[] => {
    if (!query.trim()) return []

    const results = items
        .map((item) => ({
            item,
            distance: levenshteinDistance(query, getDisplayValue(item))
        }))
        .filter(({ distance }) => distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults)
        .map(({ item }) => item)

    return results
}

/**
 * Filtra items que começam com o query ou que têm fuzzy match
 * Usado para autocomplete com prioridade em matches no início
 */
export const autocompleteSearch = <T>(
    query: string,
    items: T[],
    getDisplayValue: (item: T) => string,
    maxResults: number = 10
): T[] => {
    if (!query.trim()) return items.slice(0, maxResults)

    const lowerQuery = query.toLowerCase()

    // Primeiro: items que começam com a query
    const startsWithMatches = items.filter((item) =>
        getDisplayValue(item).toLowerCase().startsWith(lowerQuery)
    )

    // Depois: items que contêm a query
    const containsMatches = items.filter(
        (item) =>
            !startsWithMatches.includes(item) &&
            getDisplayValue(item).toLowerCase().includes(lowerQuery)
    )

    // Por fim: fuzzy matches
    const fuzzyMatches = fuzzySearch(query, items, getDisplayValue, maxResults, 2)
        .filter(
            (item) =>
                !startsWithMatches.includes(item) && !containsMatches.includes(item)
        )

    return [...startsWithMatches, ...containsMatches, ...fuzzyMatches].slice(
        0,
        maxResults
    )
}
