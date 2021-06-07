import { CommandConvert } from "../src/CommandConvert";

test('should return -1 with no file parameter', () => {
  expect(new CommandConvert().exec()).toBe(-1);
})