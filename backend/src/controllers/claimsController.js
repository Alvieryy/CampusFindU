const supabase = require('../config/supabase');
const similarityService = require('../services/similarityService');
const cache = require('../utils/cache');

exports.getAllClaims = async (req, res) => {
    const cacheKey = `claims_${JSON.stringify(req.query || {})}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cachedData);
    }

    let query = supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

    if (req.query.status) {
        query = query.eq('status', req.query.status);
    }
    if (req.query.claimant_id) {
        query = query.eq('claimant_id', req.query.claimant_id);
    }
    if (req.query.found_item_id) {
        query = query.eq('found_item_id', req.query.found_item_id);
    }
    if (req.query.limit) {
        query = query.limit(Number(req.query.limit));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    cache.set(cacheKey, data, 30);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    res.status(200).json(data);
};

exports.getClaimById = async (req, res) => {
    const cacheKey = `claim_${req.params.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedData);
    }

    const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    cache.set(cacheKey, data, 60);
    res.status(200).json(data);
};

exports.createClaim = async (req, res) => {
    const { found_item_id, claimant_id, proof_description, proof_image_url } = req.body;
    const { data, error } = await supabase
        .from('claims')
        .insert([
            { found_item_id, claimant_id, proof_description, proof_image_url, status: 'pending' }
        ])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate claims cache
    cache.invalidatePattern('claim');

    res.status(201).json(data[0]);
};

exports.updateClaim = async (req, res) => {
    const claimId = req.params.id;
    const { status, reviewed_by } = req.body;

    const normalizedStatus = (status || '').toLowerCase();

    // If claim is reaching verified completion (approved or completed)
    if (normalizedStatus === 'approved' || normalizedStatus === 'completed') {
        const result = await similarityService.resolveLostItemOnClaimCompletion(
            claimId,
            normalizedStatus,
            reviewed_by
        );

        // Invalidate relevant caches
        cache.invalidatePattern('claim');
        cache.invalidatePattern('found_item');
        cache.invalidatePattern('lost_item');

        if (result && result.claim) {
            return res.status(200).json({
                ...result.claim,
                auto_resolved_lost_item: result.resolvedLostItem || null
            });
        }
    }

    // Default update behavior
    const updatePayload = { ...req.body };
    if (normalizedStatus === 'approved' || normalizedStatus === 'rejected' || normalizedStatus === 'completed') {
        updatePayload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('claims')
        .update(updatePayload)
        .eq('id', claimId)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate claims cache
    cache.invalidatePattern('claim');

    res.status(200).json(data[0]);
};