import { insforge } from "./insforgeClient";

export interface User {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  phone?: string;
}

function mapUser(user: any, profile?: any): User {
  const email = user?.email || "";

  return {
    id: user.id,
    email: email || undefined,
    name:
      profile?.full_name ||
      user?.name ||
      user?.raw_user_meta_data?.full_name ||
      (email ? email.split("@")[0] : "User"),
    avatar:
      profile?.avatar_url ||
      user?.avatar_url ||
      user?.raw_user_meta_data?.avatar_url,
    phone: profile?.phone || user?.phone || undefined,
  };
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<User | null> {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (error) {
      console.error("Sign up failed:", error);
      throw new Error(error.message || "Sign up failed");
    }

    if (!data?.user) {
      return null;
    }

    return mapUser(data.user);
  },

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in failed:", error);
      throw new Error(error.message || "Sign in failed");
    }

    if (!data?.user) {
      return null;
    }

    return this.getCurrentUser();
  },

  async signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { data, error } = await insforge.auth.signInWithOAuth("google", {
      redirectTo,
      additionalParams: {
        prompt: "select_account",
      },
    });

    if (error) {
      console.error("Google OAuth initialization failed:", error);

      throw new Error(error.message || "Google sign-in failed");
    }

    return data;
  },

  async signOut() {
    const { error } = await insforge.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);

      throw new Error(error.message || "Sign out failed");
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await insforge.auth.getCurrentUser();

      if (error) {
        console.error("getCurrentUser error:", error);

        return null;
      }

      if (!data?.user) {
        return null;
      }

      const user = data.user;

      const { data: profile, error: profileError } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup failed:", profileError);
      }

      return mapUser(user, profile);
    } catch (error) {
      console.error("getCurrentUser unexpected error:", error);

      return null;
    }
  },
};
