const supabase = require('../config/supabase');
const cache = require('../utils/cache');

exports.getNotifications = async (req, res) => {
    const { user_id, is_read, limit } = req.query;

    let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

    if (user_id) {
        query = query.eq('user_id', user_id);
    }
    if (is_read !== undefined) {
        query = query.eq('is_read', is_read === 'true');
    }
    if (limit) {
        query = query.limit(Number(limit));
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.markAsRead = async (req, res) => {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};

exports.createNotification = async (req, res) => {
    const { user_id, title, message, type } = req.body;
    const { data, error } = await supabase
        .from('notifications')
        .insert([
            { user_id, title, message, type, is_read: false }
        ])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
};