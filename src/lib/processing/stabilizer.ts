// Basic stabilizer: if a slice returns marked final (server can mark final segments),
// move them to stable. For simplicity we accept server's partials as final for each slice.
// Here we implement a simple threshold-based stabilization (could be advanced)
export function stabilizePartial(currentStable: Record<number, string>, index: number, text: string) {
  // naive approach: accept each returned slice as stable
  return { ...currentStable, [index]: text };
}

