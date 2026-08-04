import { runVisibilityPass } from "../services/community-visibility";
const dryRun = process.argv.includes("--dry-run");
(async () => {
  const stats = await runVisibilityPass({
    dryRun,
    batchSize: 1000,
    onBatch: (s) => console.log(`processed=${s.processed} lastId=${s.lastId} show=${s.willShow} hide=${s.willHide} changed=${s.hiddenChanged}`),
  });
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
