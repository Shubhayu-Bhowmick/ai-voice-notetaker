// Merge partialTexts stored in an object by slice index
// Handles out-of-order slices and ensures proper ordering
export function mergePartials(partials: Record<number, string>): string {
  if (!partials || Object.keys(partials).length === 0) {
    return "";
  }

  // Get all indices, convert to numbers, and sort
  const sortedIndices = Object.keys(partials)
    .map((k) => Number(k))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  // Build the merged text by joining in order
  const merged = sortedIndices
    .map((index) => {
      const text = partials[index];
      return text ? text.trim() : "";
    })
    .filter((text) => text.length > 0) // Remove empty strings
    .join(" ");

  return merged;
}

