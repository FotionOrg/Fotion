import { UserRepository } from "@/be/domain/user";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { User } from "@/be/domain/user";
export class UserRepositoryImpl implements UserRepository {
  supabase: SupabaseClient;
  constructor(superbase_public_url: string, superbase_secret: string) {
    this.supabase = createClient(superbase_public_url, superbase_secret);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);
    if (error) {
      throw new Error(error.message);
    }
    return data ? new User(data.user.id, data.user.user_metadata.name, data.user.user_metadata.email) : null;
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(id);
    if (error) {
      throw new Error(error.message);
    }
  }
}
