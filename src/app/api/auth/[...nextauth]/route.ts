import NextAuth, {NextAuthOptions} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
// import Nodemailer from "next-auth/providers/nodemailer";
import { createClient } from '../../../utils/supabase/client';
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter"
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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      }, 
      from: process.env.EMAIL_FROM!,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        await transporter.sendMail({
          to: email,
          from: provider.from,
          subject: "Your sign-in link for SupBot",
          text: `Sign in to SupBot by clicking on this link: ${url}`,
          html: `<p>Sign in to SupBot by clicking on this <a href="${url}">link</a>.</p>`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  }) as any,
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
  
      // Check if the user exists in the next_auth.users table
      let { data: nextAuthUser, error: nextAuthError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
  
      if (nextAuthError && nextAuthError.code === 'PGRST116') {
        // If user does not exist in next_auth.users, create a new user
        const { data: newNextAuthUser, error: createUserError } = await supabase
          .schema('next_auth')
          .from('users')
          .insert({
            email: user.email,
            name: user.name,
            image: user.image,
          })
          .single();
  
        if (createUserError) {
          console.error("Error creating user in next_auth.users:", createUserError);
          throw new Error('Error creating user in next_auth.users');
        }
  
        nextAuthUser = newNextAuthUser;
      } else if (nextAuthError) {
        console.error("Error querying next_auth.users:", nextAuthError);
        throw new Error('Error querying next_auth.users');
      }
  
      // Check if account is defined before accessing its properties
      if (account) {
        // Check if the account is linked
        const { data: accountLink, error: accountLinkError } = await supabase
          .schema('next_auth')
          .from('accounts')
          .select('*')
          .eq('userId', nextAuthUser.id)
          .eq('provider', account.provider)
          .eq('providerAccountId', account.providerAccountId)
          .single();
  
        if (accountLinkError && accountLinkError.code === 'PGRST116') {
          // If the account is not linked, link the account
          const { error: linkError } = await supabase
            .schema('next_auth')
            .from('accounts')
            .insert({
              userId: nextAuthUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              expires_at: account.expires_at,
              refresh_token: account.refresh_token,
            });
  
          if (linkError) {
            console.error("Error linking OAuth account:", linkError);
            throw new Error('Error linking OAuth account');
          }
        } else if (accountLinkError) {
          console.error("Error querying accounts for linking:", accountLinkError);
          throw new Error('Error querying accounts for linking');
        }
      } else {
        console.error("Account data is missing during sign-in");
        throw new Error("Account data is missing during sign-in");
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

          // Check if the user exists in the next_auth.users table and is verified
          const { data: nextAuthUser, error: nextAuthError } = await supabase
            .schema('next_auth')
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          // if (nextAuthUser && nextAuthUser.emailVerified) {
          //   token.id = nextAuthUser.id;
          // } else {
          //   console.error("User not found or email not verified in next_auth.users:", nextAuthError);
          // }
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