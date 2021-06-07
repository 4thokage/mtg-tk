import { CommandVersion } from "../src/CommandVersion";

test('should show version', () => {
  expect(new CommandVersion().exec()).toBe(0);
})