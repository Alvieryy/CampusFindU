const supabase = require('../config/supabase');

exports.getNotifications = async (req, res) => {

    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.markAsRead = async (req, res) => {
    const { data, error } = await supabase.from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .select();
        
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};