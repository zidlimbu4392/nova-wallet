import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getData() {
  const [tokens, users, transactions, pools] = await Promise.all([
    prisma.token.findMany({ orderBy: { symbol: 'asc' } }),
    prisma.user.findMany({ include: { balances: true, _count: { select: { transactions: true } } } }),
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.stakingPool.findMany(),
  ]);
  return { tokens, users, transactions, pools };
}

export default async function AdminPage() {
  const { tokens, users, transactions, pools } = await getData();

  return (
    <html lang="en">
      <head>
        <title>Nova Wallet Admin</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 24px; }
          h1 { font-size: 28px; margin-bottom: 24px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          h2 { font-size: 18px; margin: 32px 0 12px; color: #a5b4fc; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #1a1a2e; border-radius: 12px; overflow: hidden; }
          th { background: #16213e; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
          td { padding: 10px 16px; border-top: 1px solid #1e293b; font-size: 14px; }
          tr:hover td { background: #1e293b; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
          .badge-success { background: #065f46; color: #34d399; }
          .badge-warn { background: #78350f; color: #fbbf24; }
          .badge-danger { background: #7f1d1d; color: #f87171; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
          .stat-card { background: #1a1a2e; border-radius: 12px; padding: 20px; }
          .stat-card .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
          .stat-card .value { font-size: 28px; font-weight: 800; margin-top: 4px; }
          .mono { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; }
          .green { color: #34d399; }
          .red { color: #f87171; }
        `}</style>
      </head>
      <body>
        <h1>🔐 Nova Wallet Admin</h1>

        {/* Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total Tokens</div>
            <div className="value">{tokens.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Total Users</div>
            <div className="value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Transactions</div>
            <div className="value">{transactions.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Staking Pools</div>
            <div className="value">{pools.length}</div>
          </div>
        </div>

        {/* Tokens */}
        <h2>💰 Tokens</h2>
        <table>
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Price USD</th><th>24h Change</th><th>Icon</th></tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id}>
                <td><strong>{t.symbol}</strong></td>
                <td>{t.name}</td>
                <td className="mono">${t.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={t.change24 >= 0 ? 'green' : 'red'}>{t.change24 >= 0 ? '+' : ''}{t.change24.toFixed(2)}%</td>
                <td className="mono">{t.icon || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Users */}
        <h2>👥 Users</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Telegram ID</th><th>Username</th><th>Admin</th><th>Balances</th><th>Transactions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="mono">{u.id.slice(0, 12)}…</td>
                <td>{u.telegramId}</td>
                <td><strong>{u.username || '—'}</strong></td>
                <td>{u.isAdmin ? <span className="badge badge-success">Admin</span> : <span className="badge badge-warn">User</span>}</td>
                <td>{u.balances.length} tokens</td>
                <td>{u._count.transactions} txs</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Staking Pools */}
        <h2>🔥 Staking Pools</h2>
        <table>
          <thead>
            <tr><th>Pool</th><th>Asset</th><th>APY</th><th>TVL</th><th>Staked</th><th>Rewards</th></tr>
          </thead>
          <tbody>
            {pools.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.asset}</td>
                <td className="green">{p.apy.toFixed(1)}%</td>
                <td>${p.tvl}</td>
                <td className="mono">{p.staked}</td>
                <td className="mono">{p.rewards}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Recent Transactions */}
        <h2>📋 Recent Transactions (last 50)</h2>
        <table>
          <thead>
            <tr><th>Type</th><th>Token</th><th>Amount</th><th>Status</th><th>Hash</th><th>Date</th></tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>
                  <span className={`badge ${tx.type === 'recv' ? 'badge-success' : tx.type === 'send' ? 'badge-danger' : 'badge-warn'}`}>
                    {tx.type}
                  </span>
                </td>
                <td>{tx.tokenId || '—'}</td>
                <td className="mono">{tx.amount}</td>
                <td>
                  <span className={`badge ${tx.status === 'success' ? 'badge-success' : tx.status === 'failed' ? 'badge-danger' : 'badge-warn'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="mono">{tx.hash ? tx.hash.slice(0, 10) + '…' : '—'}</td>
                <td className="mono">{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </body>
    </html>
  );
}
