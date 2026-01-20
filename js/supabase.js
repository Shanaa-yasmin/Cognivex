console.log('Initializing Supabase...');

if (!window.supabaseClient) {
    const SUPABASE_URL = 'https://oyaiyklvmzsxrxfnfhem.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_XwKjuzvmtNR2RuvmBqlL3w_dsK5_EbM';

    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );

    console.log('✓ Supabase client created successfully');
} else {
    console.log('✓ Supabase client already initialized');
}

// Helper function to insert data into Supabase
window.supabaseHelper = {
    async insertBehaviorData(data) {
        try {
            const supabase = window.supabaseClient;
            const { data: result, error } = await supabase
                .from('behavior_logs')
                .insert([data]);

            if (error) throw error;
            console.log('✓ Behavior data inserted:', result);
            return { success: true, result };
        } catch (error) {
            console.error('✗ Failed to insert behavior data:', error.message);
            return { success: false, error };
        }
    },

    async insertResearchNotes(notes, userId) {
        try {
            const supabase = window.supabaseClient;
            const { data: result, error } = await supabase
                .from('research_notes')
                .insert([{
                    user_id: userId,
                    content: notes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;
            console.log('✓ Research notes saved:', result);
            return { success: true, result };
        } catch (error) {
            console.error('✗ Failed to save research notes:', error.message);
            return { success: false, error };
        }
    },

    async getUserId() {
        try {
            const supabase = window.supabaseClient;
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) {
                console.warn('No active session');
                return null;
            }
            
            return session.user.id;
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    }
};