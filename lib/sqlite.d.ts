declare module "node:sqlite" {
  export interface StatementSync {
    await all(...params: unknown[]): unknown[];
    await get(...params: unknown[]): unknown;
    await run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }
  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
