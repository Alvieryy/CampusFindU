const {
    calculateSimilarity,
    SIMILARITY_THRESHOLD
} = require('./src/services/similarityService');

function runTests() {
    console.log('--- Running Similarity Algorithm Tests ---');

    let passed = 0;
    let failed = 0;

    function assert(cond, name) {
        if (cond) {
            console.log(`[PASS] ${name}`);
            passed++;
        } else {
            console.error(`[FAIL] ${name}`);
            failed++;
        }
    }

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Test 1: Identical item (category, keywords, location, date within 7 days) -> score = 100
    const lost1 = {
        title: 'Black Leather Wallet',
        description: 'Contains student ID and cash',
        category: 'Personal Item',
        location_name: 'University Library',
        created_at: threeDaysAgo.toISOString()
    };
    const found1 = {
        title: 'Found Black Leather Wallet',
        description: 'Black wallet found near bookshelves',
        category: 'Personal Item',
        location_name: 'University Library 2nd Floor',
        created_at: now.toISOString()
    };
    const score1 = calculateSimilarity(lost1, found1);
    // category (+30) + words ('black', 'leather', 'wallet' >= 2 words length > 3: +30) + location ('university library' contains: +25) + date (3 days: +15) = 100
    assert(score1 === 100, `Identical item should score 100 (got ${score1})`);
    assert(score1 >= SIMILARITY_THRESHOLD, `Score ${score1} exceeds threshold ${SIMILARITY_THRESHOLD}`);

    // Test 2: Category and location match, but completely different keywords and dates
    const lost2 = {
        title: 'Silver Hydroflask Bottle',
        description: '32oz wide mouth',
        category: 'Bottle',
        location_name: 'Gymnasium',
        created_at: twoMonthsAgo.toISOString()
    };
    const found2 = {
        title: 'Black Backpack',
        description: 'Jansport bag',
        category: 'Bottle', // same category
        location_name: 'Gymnasium', // same location
        created_at: now.toISOString() // > 30 days
    };
    const score2 = calculateSimilarity(lost2, found2);
    // category (+30) + words (0: 0) + location (+25) + date (>30 days: 0) = 55
    assert(score2 === 55, `Partial match should score 55 (got ${score2})`);
    assert(score2 < SIMILARITY_THRESHOLD, `Score ${score2} is below threshold ${SIMILARITY_THRESHOLD}`);

    // Test 3: Completely distinct items -> score = 0 (or 15 for recent date)
    const lost3 = {
        title: 'MacBook Pro 14',
        description: 'Space Gray laptop',
        category: 'Electronics',
        location_name: 'CCIS Building',
        created_at: twoMonthsAgo.toISOString()
    };
    const found3 = {
        title: 'Umbrella',
        description: 'Blue folding umbrella',
        category: 'Accessories',
        location_name: 'Cafeteria',
        created_at: now.toISOString()
    };
    const score3 = calculateSimilarity(lost3, found3);
    assert(score3 === 0, `Completely different items with old date should score 0 (got ${score3})`);

    // Test 4: Keyword matching rules (length > 3)
    const lost4 = {
        title: 'Red Cap',
        description: 'Nike hat',
        category: 'Clothing',
        location_name: 'Oval',
        created_at: threeDaysAgo.toISOString()
    };
    const found4 = {
        title: 'Red Cap',
        description: 'Nike hat',
        category: 'Clothing',
        location_name: 'Oval',
        created_at: now.toISOString()
    };
    // "red", "cap", "hat" are <= 3 characters! Only "nike" is > 3 characters (1 word match = +15)
    // category (+30) + 1 word (+15) + location (+25) + date (+15) = 85
    const score4 = calculateSimilarity(lost4, found4);
    assert(score4 === 85, `Short words ignored except words > 3 chars (got ${score4})`);
    assert(score4 >= SIMILARITY_THRESHOLD, `Score ${score4} meets threshold ${SIMILARITY_THRESHOLD}`);

    // Test 5: Date window 7-30 days gives +5
    const lost5 = {
        ...lost1,
        created_at: twentyDaysAgo.toISOString()
    };
    const score5 = calculateSimilarity(lost5, found1);
    // category (30) + words (30) + location (25) + date 20 days (+5) = 90
    assert(score5 === 90, `Date 7-30 days gives +5 (got ${score5})`);

    // Test 6: Specific custom category matching (case and whitespace insensitivity)
    const lostCustom = {
        title: 'Compound Microscope',
        description: 'Binocular lab microscope in gray case',
        category: '  Laboratory Equipment  ',
        location_name: 'Science Hall 301',
        created_at: threeDaysAgo.toISOString()
    };
    const foundCustom = {
        title: 'Found Microscope in Lab',
        description: 'Olympus binocular microscope found on bench',
        category: 'laboratory equipment',
        location_name: 'Science Hall 301',
        created_at: now.toISOString()
    };
    const scoreCustom = calculateSimilarity(lostCustom, foundCustom);
    // category (+30) + words ('microscope', 'binocular' >= 2 words: +30) + location (+25) + date (+15) = 100
    assert(scoreCustom === 100, `Custom specific category should match case-insensitively and score 100 (got ${scoreCustom})`);

    console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
