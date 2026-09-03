const supabase = require('../config/supabase');

exports.getCurrentUser = async (req, res) => {

    const userId = req.headers['user-id']; 
    
    if (!userId) return res.status(400).json({ error: "Missing user-id header" });

    const { data, error } = await supabase.from('Users').select('*').eq('id', userId).single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
};

exports.updateCurrentUser = async (req, res) => {
    const userId = req.headers['user-id'];
    

    const { fullName, contactNum } = req.body; 
    
    const { data, error } = await supabase.from('Users')
        .update({ fullName, contactNum })
        .eq('id', userId)
        .select();
        
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data[0]);
};