import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test_secret";

describe("Password hashing", () => {
  it("hashes a password and can verify it back", async () => {
    const password = "mySecret123";
    const hashed = await bcrypt.hash(password, 10);
    expect(hashed).not.toBe(password);

    const match = await bcrypt.compare(password, hashed);
    expect(match).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hashed = await bcrypt.hash("correctPassword", 10);
    const match = await bcrypt.compare("wrongPassword", hashed);
    expect(match).toBe(false);
  });
});

describe("JWT token signing", () => {
  it("signs and verifies a token with the correct user id", () => {
    const token = jwt.sign({ id: "user123" }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    expect(decoded.id).toBe("user123");
  });

  it("throws on an invalid token", () => {
    expect(() => jwt.verify("invalid.token.here", process.env.JWT_SECRET as string)).toThrow();
  });
});
