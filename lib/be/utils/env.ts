class EnvProvider {
  // if you want to access env from client, it must start with prefix 'nextPublic'
  public nextPublicSupabaseUrl: string
  public nextPublicSupabaseAnonKey: string
  public nextPublicENV: string
  public supabaseSecret: string
  public openAPIKey: string

  constructor() {
    this.nextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    this.nextPublicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    this.nextPublicENV = process.env.NEXT_PUBLIC_ENV!
    this.supabaseSecret = process.env.SUPABASE_SECRET!
    this.openAPIKey = process.env.OPENAI_API_KEY!
  }

  public isLocal(): boolean {
    return this.nextPublicENV === "local"
  }
}

export const env = new EnvProvider()
