import NextAuth, {NextAuthOptions} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '../../../utils/supabase/client';
import nodemailer from 'nodemailer';

const supabase = createClient();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST!,
  port: Number(process.env.EMAIL_SERVER_PORT!),
  auth: {
    user: process.env.EMAIL_SERVER_USER!,
    pass: process.env.EMAIL_SERVER_PASSWORD!,
  },
});


const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !user.email) {
        console.error("Sign-in attempt with invalid user data:", user);
        throw new Error("Invalid user data during sign-in");
      }
  
      // Check if the user exists in the user_profiles table
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .single();
  
      if (userProfileError && userProfileError.code === 'PGRST116') {
        // If user does not exist, create a new user profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            email: user.email,
            name: user.name,
            image: user.image,
          });
  
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw new Error('Error creating user profile');
        }
      }
  
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch the user's profile from the database
        const { data: userProfile, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (userProfile) {
          token.id = userProfile.id;
        } else {
          console.error("User not found in user_profiles:", userProfileError);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && token.id) {
        session.user.id = token.id;
      } else {
        console.error("Token or token.id is undefined:", token);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };