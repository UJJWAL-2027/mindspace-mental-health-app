import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "../../../lib/supabaseClient";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Optionally add user to Supabase 'users' table
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();
      if (!data) {
        await supabase
          .from("users")
          .insert([{ email: user.email, name: user.name }]);
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
});