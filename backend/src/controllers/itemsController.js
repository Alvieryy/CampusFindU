const supabase = require('../config/supabase');

exports.getAllLostItems = async (req, res) => {
    const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.getLostItemById = async (req, res) => {
    const { data, error } = await supabase
        .from('lost_items')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
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
    res.status(201).json(data[0]);
};

exports.updateLostItem = async (req, res) => {
    const { data, error } = await supabase
        .from('lost_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};

exports.deleteLostItem = async (req, res) => {
    const { error } = await supabase
        .from('lost_items')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Lost item deleted' });
};

exports.getAllFoundItems = async (req, res) => {
    const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.getFoundItemById = async (req, res) => {
    const { data, error } = await supabase
        .from('found_items')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
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
    res.status(201).json(data[0]);
};

exports.updateFoundItem = async (req, res) => {
    const { data, error } = await supabase
        .from('found_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};

exports.deleteFoundItem = async (req, res) => {
    const { error } = await supabase
        .from('found_items')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: 'Found item deleted' });
};