import { mkdir, writeFile as _writeFile } from "fs/promises";
import { dirname } from "path";
import { queue } from "./queue";

const byteOrderMarkIndicator = "\uFEFF";

export function writeFile(path: string, data: string, writeByteOrderMark?: boolean) {
  return queue.add(async () => {
    if (writeByteOrderMark) {
      data = byteOrderMarkIndicator + data;
    }
    try {
      await _writeFile(path, data);
    } catch {
      await mkdir(dirname(path), { recursive: true });
      await _writeFile(path, data);
    }
  });
}
