const supabase = require('../config/supabase');
const similarityService = require('../services/similarityService');
const cache = require('../utils/cache');

exports.getAllLostItems = async (req, res) => {
    const cacheKey = `lost_items_${JSON.stringify(req.query || {})}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cachedData);
    }

    let query = supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

    // Support query filters
    if (req.query.status) {
        query = query.eq('status', req.query.status);
    } else if (req.query.active === 'true') {
        query = query.eq('status', 'lost');
    }

    if (req.query.user_id) {
        query = query.eq('user_id', req.query.user_id);
    }

    if (req.query.limit) {
        query = query.limit(Number(req.query.limit));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Store in cache for 30 seconds
    cache.set(cacheKey, data, 30);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    res.status(200).json(data);
};

exports.getLostItemById = async (req, res) => {
    const cacheKey = `lost_item_${req.params.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedData);
    }

    const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    cache.set(cacheKey, data, 60);
    res.status(200).json(data);
};

exports.createLostItem = async (req, res) => {
    const { user_id, title, description, category, latitude, longitude, location_name, image_url, status } = req.body;
    const { data, error } = await supabase
        .from('lost_items')
        .insert([
            { user_id, title, description, category, latitude, longitude, location_name, image_url, status: status || 'lost' }
        ])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate cached lost items
    cache.invalidatePattern('lost_item');

    res.status(201).json(data[0]);
};

exports.updateLostItem = async (req, res) => {
    const { data, error } = await supabase
        .from('lost_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate cached lost items
    cache.invalidatePattern('lost_item');

    res.status(200).json(data[0]);
};

exports.deleteLostItem = async (req, res) => {
    const { error } = await supabase
        .from('lost_items')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate cached lost items
    cache.invalidatePattern('lost_item');

    res.status(200).json({ message: 'Lost item deleted' });
};

exports.getAllFoundItems = async (req, res) => {
    const cacheKey = `found_items_${JSON.stringify(req.query || {})}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cachedData);
    }

    let query = supabase
        .from('found_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (req.query.status) {
        query = query.eq('status', req.query.status);
    } else if (req.query.active === 'true') {
        query = query.eq('status', 'found');
    }

    if (req.query.user_id) {
        query = query.eq('user_id', req.query.user_id);
    }

    if (req.query.limit) {
        query = query.limit(Number(req.query.limit));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Store in cache for 30 seconds
    cache.set(cacheKey, data, 30);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    res.status(200).json(data);
};

exports.getFoundItemById = async (req, res) => {
    const cacheKey = `found_item_${req.params.id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedData);
    }

    const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
    cache.set(cacheKey, data, 60);
    res.status(200).json(data);
};

exports.createFoundItem = async (req, res) => {
    const { user_id, title, description, category, latitude, longitude, location_name, image_url, status } = req.body;
    const { data, error } = await supabase
        .from('found_items')
        .insert([
            { user_id, title, description, category, latitude, longitude, location_name, image_url, status: status || 'found' }
        ])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    const createdFoundItem = data[0];

    // Invalidate cached found items
    cache.invalidatePattern('found_item');

    // Automatic Lost Item Resolution
    // 1. Same-user check: if user_id matches an active lost report with high confidence, auto-resolve it
    let autoResolvedLost = null;
    if (user_id) {
        autoResolvedLost = await similarityService.resolveMatchingLostForSameUser(createdFoundItem, user_id);

        if (autoResolvedLost) {
            // Invalidate lost items cache since an item was auto-resolved
            cache.invalidatePattern('lost_item');
        }

        // 2. Different-user check: notify owners of matching lost items about potential match
        await similarityService.notifyPotentialMatchesForOtherUsers(createdFoundItem, user_id);
    }

    res.status(201).json({
        ...createdFoundItem,
        auto_resolved_lost_item: autoResolvedLost || null
    });
};

exports.updateFoundItem = async (req, res) => {
    const { data, error } = await supabase
        .from('found_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate cached found items
    cache.invalidatePattern('found_item');

    res.status(200).json(data[0]);
};

exports.deleteFoundItem = async (req, res) => {
    const { error } = await supabase
        .from('found_items')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });

    // Invalidate cached found items
    cache.invalidatePattern('found_item');

    res.status(200).json({ message: 'Found item deleted' });
};