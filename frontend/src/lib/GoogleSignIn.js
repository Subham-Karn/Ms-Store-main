import supabase from "./supabaseClient"
export const signInWithGoogle = async () =>{
    const redirectLink = "https://ms-currency-store.onrender.com/auth/callback"
    try {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectLink
            }   
        })
    } catch (error) {
        console.error('Error signing in with Google:', error.message);
    }
}