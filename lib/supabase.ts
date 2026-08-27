import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rcvpahjzxbxgfaitlyil.supabase.co';

// ⚠️ ก๊อปปี้รหัสจาก Supabase (ตรง Publishable key ที่ขึ้นต้นด้วย sb_publishable_...) มาวางแทนข้อความด้านล่างนี้
const supabaseAnonKey = 'sb_publishable_ORN-SZILyS1FBwF2SxeWcw_-h5DuMA7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);