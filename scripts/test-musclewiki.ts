// Built-in fetch in Node 18+

async function runTests() {
  console.log('=== STARTING MUSCLEWIKI MEDIA & API INTEGRATION TEST ===');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Fetch MuscleWiki Exercises Endpoint
  console.log('\n--- TEST 1: /api/musclewiki/exercises ---');
  try {
    const res = await fetch(`${baseUrl}/api/musclewiki/exercises?category=chest`);
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Success:', data.success);
    console.log('Source:', data.source);
    console.log('Exercise Count:', data.count);
    if (data.exercises && data.exercises.length > 0) {
      console.log('First Exercise Name:', data.exercises[0].nameFa, `(${data.exercises[0].nameEn})`);
      console.log('First Exercise gifUrl:', data.exercises[0].gifUrl);
    } else {
      console.error('FAIL: No exercises returned');
    }
  } catch (err: any) {
    console.error('FAIL in Test 1:', err.message);
  }

  // Test 2: Local Static Exercise Asset
  console.log('\n--- TEST 2: Static Exercise GIF (/exercises/Incline_Dumbbell_Press.gif) ---');
  try {
    const res = await fetch(`${baseUrl}/exercises/Incline_Dumbbell_Press.gif`);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
    if (res.status === 200 && res.headers.get('content-type')?.includes('image/gif')) {
      console.log('PASS: Static exercise GIF loaded successfully.');
    } else {
      console.error('FAIL: Static exercise GIF failed to load.');
    }
  } catch (err: any) {
    console.error('FAIL in Test 2:', err.message);
  }

  // Test 3: Proxy Media Endpoint with Relative URL
  console.log('\n--- TEST 3: /api/proxy-media with local relative URL ---');
  try {
    const res = await fetch(`${baseUrl}/api/proxy-media?url=${encodeURIComponent('/exercises/Dumbbell_Bench_Press.gif')}`);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    if (res.ok) {
      console.log('PASS: Proxy media local asset returned OK');
    } else {
      console.error('FAIL: Proxy media local asset failed');
    }
  } catch (err: any) {
    console.error('FAIL in Test 3:', err.message);
  }

  // Test 4: Proxy Media Endpoint with External URL Fallback
  console.log('\n--- TEST 4: /api/proxy-media with External Blocked URL ---');
  try {
    const testUrl = 'https://media.musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4';
    const res = await fetch(`${baseUrl}/api/proxy-media?url=${encodeURIComponent(testUrl)}&exerciseName=Barbell_Bench_Press&category=chest`);
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const buffer = await res.arrayBuffer();
    console.log('Downloaded Byte Size:', buffer.byteLength);
    if (res.ok && buffer.byteLength > 1000) {
      console.log('PASS: Proxy media successfully handled external media (via streaming or fallback).');
    } else {
      console.error('FAIL: Proxy media returned empty or error response for external media.');
    }
  } catch (err: any) {
    console.error('FAIL in Test 4:', err.message);
  }

  console.log('\n=== TEST COMPLETED ===');
}

runTests();
