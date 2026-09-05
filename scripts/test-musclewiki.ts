// Built-in fetch in Node 18+
// Smoke check: official MuscleWiki API proxy + media streaming (no local GIF fallback)

async function runTests() {
  console.log('=== STARTING MUSCLEWIKI API & MEDIA INTEGRATION TEST ===');

  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  let failed = 0;

  // Test 1: Fetch MuscleWiki Exercises Endpoint (official API only)
  console.log('\n--- TEST 1: /api/musclewiki/exercises ---');
  let firstGifUrl = '';
  try {
    const res = await fetch(`${baseUrl}/api/musclewiki/exercises?category=chest`);
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Success:', data.success);
    console.log('Source:', data.source);
    console.log('Exercise Count:', data.count);
    if (data.details) console.log('Details:', String(data.details).slice(0, 200));

    if (res.status === 503 && String(data.error || '').includes('MUSCLEWIKI_API_KEY')) {
      console.error('FAIL: MUSCLEWIKI_API_KEY missing in server env');
      failed++;
    } else if (res.status === 403 || (res.status === 502 && String(data.error || '').includes('403'))) {
      console.warn('WARN: MuscleWiki API key rejected (403). Playground/BASIC keys only work on api.musclewiki.com; use a TESTING+ key in .env');
    } else if (data.exercises && data.exercises.length > 0) {
      console.log('First Exercise Name:', data.exercises[0].nameFa, `(${data.exercises[0].nameEn})`);
      console.log('First Exercise gifUrl:', data.exercises[0].gifUrl);
      firstGifUrl = data.exercises[0].gifUrl || '';
      if (!String(data.source || '').includes('Official') && !String(data.source || '').includes('API')) {
        console.error('FAIL: Expected official API source, got:', data.source);
        failed++;
      } else if (!String(firstGifUrl).includes('/api/proxy-media')) {
        console.error('FAIL: Expected proxied gifUrl, got:', firstGifUrl);
        failed++;
      } else {
        console.log('PASS: Official API returned proxied media URL');
      }
    } else if (res.ok) {
      console.warn('WARN: API OK but empty exercise list');
    } else {
      console.error('FAIL: No exercises returned', data.error || '');
      failed++;
    }
  } catch (err: any) {
    console.error('FAIL in Test 1:', err.message);
    failed++;
  }

  // Test 2: Proxy media for MuscleWiki CDN video
  console.log('\n--- TEST 2: /api/proxy-media for API media ---');
  try {
    const mediaPath =
      firstGifUrl ||
      `/api/proxy-media?url=${encodeURIComponent('https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4')}`;
    const res = await fetch(mediaPath.startsWith('http') ? mediaPath : `${baseUrl}${mediaPath}`);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buffer = await res.arrayBuffer();
    console.log('Downloaded Byte Size:', buffer.byteLength);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && buffer.byteLength > 1000 && (ct.includes('video') || ct.includes('image') || ct.includes('octet'))) {
      console.log('PASS: Proxy media returned binary media');
    } else {
      console.error('FAIL: Proxy media returned empty or non-media response');
      failed++;
    }
  } catch (err: any) {
    console.error('FAIL in Test 2:', err.message);
    failed++;
  }

  // Test 3: Local paths must not be served as proxy targets
  console.log('\n--- TEST 3: local path rejected by proxy ---');
  try {
    const res = await fetch(`${baseUrl}/api/proxy-media?url=${encodeURIComponent('/exercises/Dumbbell_Bench_Press.gif')}`);
    console.log('Status:', res.status);
    if (res.status >= 400) {
      console.log('PASS: Local media path correctly rejected');
    } else {
      console.error('FAIL: Local path should be rejected');
      failed++;
    }
  } catch (err: any) {
    console.error('FAIL in Test 3:', err.message);
    failed++;
  }

  console.log('\n=== TEST COMPLETED ===');
  if (failed > 0) {
    console.error(`Result: ${failed} failure(s)`);
    process.exit(1);
  }
  console.log('Result: OK');
}

runTests();
