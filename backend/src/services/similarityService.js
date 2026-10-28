const supabase = require('../config/supabase');

const SIMILARITY_THRESHOLD = 70;

/**
 * Calculates similarity between a lost item and a found item
 * Reuses the exact scoring criteria and weights from SmartMatch.jsx:
 * - Category match: +30
 * - Keyword overlap in title + description (words with length > 3): 1 match = +15, >=2 matches = +30
 * - Location substring match: +25
 * - Date proximity: 0-7 days = +15, 7-30 days = +5
 * Threshold: score >= 70
 */
function calculateSimilarity(lost, found) {
    if (!lost || !found) return 0;

    let score = 0;

    // 1. Category match
    if (lost.category && found.category && lost.category.trim().toLowerCase() === found.category.trim().toLowerCase()) {
        score += 30;
    }

    // 2. Keyword overlap in title and description
    const lostText = `${lost.title || ''} ${lost.description || ''}`.toLowerCase();
    const foundText = `${found.title || ''} ${found.description || ''}`.toLowerCase();

    const lostWords = lostText.match(/\w+/g) || [];
    const foundWords = foundText.match(/\w+/g) || [];

    let matchCount = 0;
    lostWords.forEach((word) => {
        if (word.length > 3 && foundWords.includes(word)) {
            matchCount++;
        }
    });

    if (matchCount === 1) score += 15;
    if (matchCount >= 2) score += 30;

    // 3. Location proximity / name match
    if (lost.location_name && found.location_name) {
        const locLost = lost.location_name.trim().toLowerCase();
        const locFound = found.location_name.trim().toLowerCase();
        if (locLost.includes(locFound) || locFound.includes(locLost)) {
            score += 25;
        }
    }

    // 4. Date proximity
    const lostDate = new Date(lost.created_at || Date.now());
    const foundDate = new Date(found.created_at || Date.now());
    const diffDays = (foundDate - lostDate) / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 7) {
        score += 15;
    } else if (diffDays > 7 && diffDays <= 30) {
        score += 5;
    }

    return score;
}

/**
 * Scenario 1: Same User Reports Found Item
 * When a user reports finding an item:
 * 1. Checks if the user has an active lost item report (status === 'lost')
 * 2. Uses similarity matching to check for matches
 * 3. If there is exactly one unique match (score >= 70), automatically marks the lost item as 'resolved'
 * 4. Dispatches a notification to the user
 * 5. If ambiguous (multiple matches) or no match, keeps lost report(s) active
 */
async function resolveMatchingLostForSameUser(foundItem, userId) {
    if (!foundItem || !userId) return null;

    try {
        // Query active lost items for this authenticated user
        const { data: userLostItems, error } = await supabase
            .from('lost_items')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'lost');

        if (error) {
            console.error('Error querying active lost items for same user:', error.message);
            return null;
        }

        if (!userLostItems || userLostItems.length === 0) {
            return null;
        }

        // Calculate similarity for each active lost report
        const qualifyingMatches = [];
        for (const lost of userLostItems) {
            const score = calculateSimilarity(lost, foundItem);
            if (score >= SIMILARITY_THRESHOLD) {
                qualifyingMatches.push({ lost, score });
            }
        }

        // Sort descending by score
        qualifyingMatches.sort((a, b) => b.score - a.score);

        // Require one unique, unambiguous high-confidence match
        if (qualifyingMatches.length === 1) {
            const matchedLost = qualifyingMatches[0].lost;

            // Atomically update the lost item status to 'resolved' (only if currently 'lost' to prevent race conditions)
            const { data: updatedLost, error: updateError } = await supabase
                .from('lost_items')
                .update({ status: 'resolved' })
                .eq('id', matchedLost.id)
                .eq('status', 'lost')
                .select();

            if (updateError) {
                console.error('Error resolving lost item for same user:', updateError.message);
                return null;
            }

            if (updatedLost && updatedLost.length > 0) {
                // Dispatch notification to user
                await supabase
                    .from('notifications')
                    .insert([
                        {
                            user_id: userId,
                            title: 'Lost Item Auto-Resolved',
                            message: `Your lost item report "${matchedLost.title}" has been automatically resolved because you reported finding a matching item.`,
                            type: 'success',
                            is_read: false
                        }
                    ]);

                return updatedLost[0];
            }
        }

        // If multiple matches exist, it is ambiguous; keep all reports active
        return null;
    } catch (err) {
        console.error('Error in resolveMatchingLostForSameUser:', err);
        return null;
    }
}

/**
 * Scenario 2: Different Users
 * When a user reports finding an item that matches another user's active lost report:
 * - Identifies potential matches without resolving the lost item
 * - Preserves the claim verification process
 * - Sends a notification about the potential match
 */
async function notifyPotentialMatchesForOtherUsers(foundItem, reporterUserId) {
    if (!foundItem || !reporterUserId) return [];

    try {
        // Query active lost items for other users
        const { data: otherLostItems, error } = await supabase
            .from('lost_items')
            .select('*')
            .eq('status', 'lost')
            .neq('user_id', reporterUserId);

        if (error) {
            console.error('Error querying lost items for other users:', error.message);
            return [];
        }

        if (!otherLostItems || otherLostItems.length === 0) {
            return [];
        }

        const notifications = [];
        for (const lost of otherLostItems) {
            const score = calculateSimilarity(lost, foundItem);
            if (score >= SIMILARITY_THRESHOLD) {
                // Send potential match notification to the lost item owner
                const { data: notif } = await supabase
                    .from('notifications')
                    .insert([
                        {
                            user_id: lost.user_id,
                            title: 'Potential Match Found',
                            message: `A found item matching your lost report "${lost.title}" was reported at ${foundItem.location_name || 'campus'}. Check the found items board to review and claim it.`,
                            type: 'info',
                            is_read: false
                        }
                    ])
                    .select();

                if (notif && notif[0]) {
                    notifications.push(notif[0]);
                }
            }
        }

        return notifications;
    } catch (err) {
        console.error('Error in notifyPotentialMatchesForOtherUsers:', err);
        return [];
    }
}

/**
 * Scenario 3 & 4: Automatic Resolution After Claim Completion
 * When a claim reaches its verified completion status (e.g. status === 'approved' or 'completed'):
 * 1. Automatically updates the claimant's matching lost item to 'resolved'
 * 2. Updates the associated found item status to 'claimed'
 * 3. Records the resolution timestamp on the claim (reviewed_at)
 * 4. Prevents duplicate resolution operations
 */
async function resolveLostItemOnClaimCompletion(claimId, newStatus, reviewerId = null) {
    if (!claimId) return null;

    const normalizedStatus = (newStatus || '').toLowerCase();
    if (normalizedStatus !== 'approved' && normalizedStatus !== 'completed') {
        return null;
    }

    try {
        // Fetch current claim details
        const { data: claim, error: claimError } = await supabase
            .from('claims')
            .select('*')
            .eq('id', claimId)
            .single();

        if (claimError || !claim) {
            console.error('Error fetching claim for completion:', claimError?.message);
            return null;
        }

        // Prevent duplicate execution if already approved/completed
        if (claim.status === 'approved' || claim.status === 'completed') {
            return null;
        }

        // Fetch corresponding found item
        const { data: foundItem, error: foundError } = await supabase
            .from('found_items')
            .select('*')
            .eq('id', claim.found_item_id)
            .single();

        if (foundError || !foundItem) {
            console.error('Error fetching found item for claim:', foundError?.message);
            return null;
        }

        // 1. Update found item status to 'claimed'
        await supabase
            .from('found_items')
            .update({ status: 'claimed' })
            .eq('id', claim.found_item_id);

        // 2. Check if the claimant has an active lost item matching this found item
        const { data: claimantLostItems, error: lostError } = await supabase
            .from('lost_items')
            .select('*')
            .eq('user_id', claim.claimant_id)
            .eq('status', 'lost');

        let resolvedLostItem = null;

        if (!lostError && claimantLostItems && claimantLostItems.length > 0) {
            const matches = [];
            for (const lost of claimantLostItems) {
                const score = calculateSimilarity(lost, foundItem);
                if (score >= SIMILARITY_THRESHOLD) {
                    matches.push({ lost, score });
                }
            }

            matches.sort((a, b) => b.score - a.score);

            // If a unique match exists (or single top match with score >= 70)
            if (matches.length === 1 || (matches.length > 1 && matches[0].score > matches[1].score)) {
                const targetLost = matches[0].lost;

                // Atomically update lost item to 'resolved'
                const { data: updatedLost } = await supabase
                    .from('lost_items')
                    .update({ status: 'resolved' })
                    .eq('id', targetLost.id)
                    .eq('status', 'lost')
                    .select();

                if (updatedLost && updatedLost.length > 0) {
                    resolvedLostItem = updatedLost[0];

                    // Notify claimant that their lost item report is resolved
                    await supabase
                        .from('notifications')
                        .insert([
                            {
                                user_id: claim.claimant_id,
                                title: 'Lost Item Resolved',
                                message: `Your lost item report "${targetLost.title}" has been automatically marked as resolved following your approved claim for "${foundItem.title}".`,
                                type: 'success',
                                is_read: false
                            }
                        ]);
                }
            }
        }

        // 3. Record review timestamp and status on the claim
        const updatePayload = {
            status: normalizedStatus,
            reviewed_at: new Date().toISOString()
        };
        if (reviewerId) {
            updatePayload.reviewed_by = reviewerId;
        }

        const { data: updatedClaim } = await supabase
            .from('claims')
            .update(updatePayload)
            .eq('id', claimId)
            .select();

        return {
            claim: updatedClaim ? updatedClaim[0] : null,
            resolvedLostItem
        };
    } catch (err) {
        console.error('Error in resolveLostItemOnClaimCompletion:', err);
        return null;
    }
}

module.exports = {
    SIMILARITY_THRESHOLD,
    calculateSimilarity,
    resolveMatchingLostForSameUser,
    notifyPotentialMatchesForOtherUsers,
    resolveLostItemOnClaimCompletion
};
