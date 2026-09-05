// Smoke check: free exercise catalog + image CDN

async function runTests() {
  console.log("=== FREE EXERCISE CATALOG SMOKE TEST ===");

  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  let failed = 0;

  console.log("\n--- TEST 1: /api/musclewiki/exercises?category=chest ---");
  let firstGifUrl = "";
  try {
    const res = await fetch(`${baseUrl}/api/musclewiki/exercises?category=chest`);
    const data = await res.json();
    console.log("Status:", res.status, "source:", data.source, "count:", data.count);

    if (!res.ok || !data.success) {
      console.error("FAIL:", data.error || res.status);
      failed++;
    } else if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
      console.error("FAIL: empty chest list");
      failed++;
    } else if (!String(data.source || "").includes("Free Exercise")) {
      console.error("FAIL: expected Free Exercise DB source, got:", data.source);
      failed++;
    } else {
      firstGifUrl = data.exercises[0].gifUrl || "";
      console.log("First:", data.exercises[0].nameEn, firstGifUrl.slice(0, 80));
      if (!firstGifUrl.includes("jsdelivr") && !firstGifUrl.includes("free-exercise-db")) {
        console.error("FAIL: unexpected media URL", firstGifUrl);
        failed++;
      } else {
        console.log("PASS: catalog returned exercises with CDN images");
      }
    }
  } catch (err: any) {
    console.error("FAIL in Test 1:", err.message);
    failed++;
  }

  console.log("\n--- TEST 2: search q=bench ---");
  try {
    const res = await fetch(`${baseUrl}/api/musclewiki/exercises?q=bench`);
    const data = await res.json();
    console.log("Status:", res.status, "count:", data.count);
    if (!res.ok || !(data.count > 0)) {
      console.error("FAIL: search returned nothing");
      failed++;
    } else {
      console.log("PASS: search works");
    }
  } catch (err: any) {
    console.error("FAIL in Test 2:", err.message);
    failed++;
  }

  console.log("\n--- TEST 3: CDN image fetch ---");
  try {
    const url =
      firstGifUrl ||
      "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg";
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    console.log("Status:", res.status, "bytes:", buf.byteLength, "type:", res.headers.get("content-type"));
    if (res.ok && buf.byteLength > 1000) {
      console.log("PASS: CDN image OK");
    } else {
      console.error("FAIL: CDN image unavailable");
      failed++;
    }
  } catch (err: any) {
    console.error("FAIL in Test 3:", err.message);
    failed++;
  }

  console.log("\n=== TEST COMPLETED ===");
  if (failed > 0) {
    console.error(`Result: ${failed} failure(s)`);
    process.exit(1);
  }
  console.log("Result: OK");
}

runTests();
