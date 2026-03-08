// Supabase Edge Function: daily-elimination
// 毎日 23:59 JST（14:59 UTC）に実行し、当日投稿がない参加者を脱落させる
//
// デプロイ:
//   supabase functions deploy daily-elimination
//
// Cron スケジュール設定（Supabase Dashboard → Edge Functions → Schedules）:
//   59 14 * * *   ← JST 23:59 = UTC 14:59
//
// 環境変数:
//   SUPABASE_URL              : （自動設定）
//   SUPABASE_SERVICE_ROLE_KEY : （自動設定）
//   ELIMINATION_SECRET        : cronリクエスト認証用シークレット（任意）

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const SUPABASE_URL  = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const SECRET        = Deno.env.get('ELIMINATION_SECRET') ?? '';

  // シークレット認証（設定されている場合のみ検証）
  if (SECRET) {
    const auth = req.headers.get('Authorization') ?? '';
    if (auth !== `Bearer ${SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // JST の「今日」を計算（UTC+9）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(now.getTime() + jstOffset);
    const today = jstDate.toISOString().slice(0, 10); // YYYY-MM-DD

    console.log(`[daily-elimination] 実行日: ${today} (JST)`);

    // 1. アクティブなチャレンジを取得
    const { data: challenges, error: chErr } = await sb
      .from('majiroom_challenges')
      .select('id, title, start_date, end_date')
      .eq('status', 'active');

    if (chErr) throw chErr;
    if (!challenges || challenges.length === 0) {
      console.log('[daily-elimination] アクティブなチャレンジなし');
      return new Response(JSON.stringify({ message: 'No active challenges', eliminated: 0 }), {
        status: 200, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    let totalEliminated = 0;
    const results: { challengeId: string; eliminated: string[] }[] = [];

    for (const challenge of challenges) {
      console.log(`[daily-elimination] チャレンジ: ${challenge.id} (${challenge.title})`);

      // 2. このチャレンジの生存中の参加者を取得
      const { data: participants, error: pErr } = await sb
        .from('majiroom_participants')
        .select('user_id')
        .eq('challenge_id', challenge.id)
        .eq('status', 'active');

      if (pErr) { console.error('participants fetch error:', pErr); continue; }
      if (!participants || participants.length === 0) continue;

      const participantIds = participants.map(p => p.user_id);

      // 3. 今日投稿したユーザーを取得
      const { data: todayPosts, error: postErr } = await sb
        .from('majiroom_posts')
        .select('user_id')
        .eq('challenge_id', challenge.id)
        .gte('created_at', `${today}T00:00:00+09:00`)
        .lte('created_at', `${today}T23:59:59+09:00`);

      if (postErr) { console.error('posts fetch error:', postErr); continue; }

      const postedUserIds = new Set((todayPosts || []).map(p => p.user_id));

      // 4. 未投稿者を特定
      const toEliminate = participantIds.filter(uid => !postedUserIds.has(uid));

      if (toEliminate.length === 0) {
        console.log(`[daily-elimination] ${challenge.id}: 脱落者なし（全員投稿済み）`);
        continue;
      }

      // 5. 脱落処理
      const { error: elimErr } = await sb
        .from('majiroom_participants')
        .update({ status: 'eliminated', eliminated_at: new Date().toISOString() })
        .eq('challenge_id', challenge.id)
        .in('user_id', toEliminate);

      if (elimErr) {
        console.error(`[daily-elimination] 脱落更新エラー:`, elimErr);
        continue;
      }

      // 6. 脱落通知を送信
      const notifications = toEliminate.map(uid => ({
        to_user_id:   uid,
        from_user_id: uid, // システム通知なのでself
        type:         'elimination',
        message:      `⚠️ 本気14日チャレンジ「${challenge.title}」から脱落しました。今日の投稿が確認できませんでした。`,
        is_read:      false,
      }));
      await sb.from('notifications').insert(notifications).then(
        ({ error: nErr }) => { if (nErr) console.warn('通知送信失敗:', nErr); }
      );

      totalEliminated += toEliminate.length;
      results.push({ challengeId: challenge.id, eliminated: toEliminate });
      console.log(`[daily-elimination] ${challenge.id}: ${toEliminate.length}名脱落`);
    }

    return new Response(
      JSON.stringify({ message: 'Done', date: today, total_eliminated: totalEliminated, results }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('[daily-elimination] エラー:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
