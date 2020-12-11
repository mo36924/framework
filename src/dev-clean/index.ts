import { readdir, rmdir, unlink } from "fs/promises";
import { exit } from "process";

(async () => {
  const [dirs] = await Promise.all([
    readdir(".", { withFileTypes: true }),
    unlink("tsconfig.tsbuildinfo").catch(() => {}),
  ]);
  await Promise.allSettled(
    dirs.map(async (dir) => {
      const name = dir.name;
      if (!dir.isDirectory() || name[0] === "." || name === "patches" || name === "node_modules" || name === "src") {
        return;
      }
      await rmdir(name, { recursive: true });
    })
  );
})().catch((err) => {
  console.log(err);
  exit(1);
});
