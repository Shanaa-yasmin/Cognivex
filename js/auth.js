window.authHandler = {

    isLoginPage() {
        return window.location.pathname.includes('index.html') ||
               window.location.pathname === '/' ||
               window.location.pathname.endsWith('/');
    },

    init() {
        this.checkSession();
        this.sessionInterval = setInterval(() => {
            this.checkSession();
        }, 60000);
    },

    async checkSession() {
        try {
            const supabase = window.supabaseClient; // ✅ CORRECT

            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }

            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            const session = data.session;
            console.log('Session:', session);

            if (session) {
                if (this.isLoginPage()) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                if (!this.isLoginPage()) {
                    window.location.href = 'index.html';
                }
            }

        } catch (error) {
            console.error('Session check error:', error);
            if (!this.isLoginPage()) {
                window.location.href = 'index.html';
            }
        }
    },

    async login(email, password) {
        const errorMessage = document.getElementById('error-message');
        const loginButton = document.querySelector('#loginForm button[type="submit"]');
        const originalButtonText = loginButton?.textContent || 'Sign In';

        try {
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = 'Signing in...';
            }

            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.classList.remove('visible');
            }

            const supabase = window.supabaseClient; // ✅ CORRECT
            if (!supabase) throw new Error('Authentication service not available');

            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) throw error;

            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Login error:', error);

            if (errorMessage) {
                errorMessage.textContent =
                    error.message || 'Invalid email or password';
                errorMessage.classList.add('visible');

                setTimeout(() => {
                    errorMessage.classList.remove('visible');
                }, 5000);
            }

        } finally {
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = originalButtonText;
            }
        }
    },

    async logout() {
        try {
            const supabase = window.supabaseClient; // ✅ CORRECT
            if (!supabase) return;

            await supabase.auth.signOut();
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'index.html';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing auth...');

    const waitForSupabase = setInterval(() => {
        if (window.supabaseClient) { // ✅ CORRECT
            clearInterval(waitForSupabase);
            window.authHandler.init();
        }
    }, 100);
});
