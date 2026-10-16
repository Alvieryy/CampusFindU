const supabase = require('../config/supabase');

exports.getAllClaims = async (req, res) => {
    const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.getClaimById = async (req, res) => {
    const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(500).json({ error: error.message });
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
    res.status(201).json(data[0]);
};

exports.updateClaim = async (req, res) => {
    const { data, error } = await supabase
        .from('claims')
        .update(req.body)
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};