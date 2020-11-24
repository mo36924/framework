import { readdir, rmdir, unlink } from "fs/promises";
import { exit } from "process";

(async () => {
  const sourceDir = "src";
  const [dirs] = await Promise.all([
    readdir(sourceDir, { withFileTypes: true }),
    unlink("tsconfig.tsbuildinfo").catch(() => {}),
  ]);
  await Promise.allSettled(
    dirs.map(async (dir) => {
      if (!dir.isDirectory()) {
        return;
      }
      await rmdir(dir.name, { recursive: true });
    })
  );
})().catch((err) => {
  console.log(err);
  exit(1);
});
