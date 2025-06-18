import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// 현재 환경에 맞는 콜백 URL 생성 함수
function getCallbackUrl() {
  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href);
    const callbackUrl = `${currentUrl.protocol}//${currentUrl.hostname}${
      currentUrl.port ? ":" + currentUrl.port : ""
    }/auth/callback`;
    console.log("생성된 콜백 URL:", callbackUrl);
    return callbackUrl;
  }
  // 서버 사이드에서는 기본값 사용
  return "/auth/callback";
}

// 유틸리티 함수들
export const getUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("사용자 정보 가져오기 오류:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("getUser 예외:", error);
    return null;
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log("Google 로그인 시도 시작");

    const callbackUrl = getCallbackUrl();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google 로그인 오류:", error);
    } else {
      console.log("Google 로그인 리다이렉션 시작:", data);
      console.log("사용될 콜백 URL:", callbackUrl);
    }

    return { data, error };
  } catch (error) {
    console.error("signInWithGoogle 예외:", error);
    return { data: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("이메일 로그인 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("signInWithEmail 예외:", error);
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const callbackUrl = getCallbackUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      console.error("회원가입 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("signUp 예외:", error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    console.log("로그아웃 시도 시작");

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("로그아웃 오류:", error);
    } else {
      console.log("로그아웃 성공");
    }

    return { error };
  } catch (error) {
    console.error("signOut 예외:", error);
    return { error };
  }
};

// 사용자 프로필 관련 함수들
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("프로필 가져오기 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("getUserProfile 예외:", error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates })
      .select();

    if (error) {
      console.error("프로필 업데이트 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("updateUserProfile 예외:", error);
    return { data: null, error };
  }
};

// 댓글 관련 함수들
export const getComments = async (postSlug: string) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        profiles (
          email
        )
      `
      )
      .eq("post_slug", postSlug)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("댓글 가져오기 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("getComments 예외:", error);
    return { data: null, error };
  }
};

export const addComment = async (
  postSlug: string,
  content: string,
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_slug: postSlug,
          content,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      console.error("댓글 추가 오류:", error);
    }

    return { data, error };
  } catch (error) {
    console.error("addComment 예외:", error);
    return { data: null, error };
  }
};
