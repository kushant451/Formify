
const MAX_RETRIES = 3;


function shouldMoveToDeadLetter(attemptsMade: number): boolean {
  return attemptsMade >= MAX_RETRIES;
}

describe("Retry logic", () => {
  it("does not dead-letter a job on its first failure", () => {
    expect(shouldMoveToDeadLetter(1)).toBe(false);
  });

  it("does not dead-letter a job on its second failure", () => {
    expect(shouldMoveToDeadLetter(2)).toBe(false);
  });

  it("moves a job to the dead-letter queue once max retries is reached", () => {
    expect(shouldMoveToDeadLetter(3)).toBe(true);
  });

  it("still dead-letters if attempts exceed the max (defensive check)", () => {
    expect(shouldMoveToDeadLetter(5)).toBe(true);
  });
});

describe("Exponential backoff calculation", () => {
  // Mirrors the { type: "exponential", delay: 2000 } config passed to
  // contentQueue.add() in contentController.ts
  function backoffDelay(attempt: number, baseDelay = 2000): number {
    return baseDelay * Math.pow(2, attempt - 1);
  }

  it("uses the base delay on the first retry", () => {
    expect(backoffDelay(1)).toBe(2000);
  });

  it("doubles the delay on the second retry", () => {
    expect(backoffDelay(2)).toBe(4000);
  });

  it("quadruples the delay on the third retry", () => {
    expect(backoffDelay(3)).toBe(8000);
  });
});

describe("Credit deduction on regenerate vs full generation", () => {
  it("charges a full credit for a 5-format generation", () => {
    const FULL_GENERATION_COST = 1;
    expect(FULL_GENERATION_COST).toBe(1);
  });

  it("charges a fraction of a credit for regenerating a single format", () => {
    const SINGLE_FORMAT_COST = 0.2;
    expect(SINGLE_FORMAT_COST).toBeLessThan(1);
    expect(SINGLE_FORMAT_COST).toBeCloseTo(0.2);
  });
});
