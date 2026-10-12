import { DatabaseType } from '../DatabaseFactory';

export class SqlDialect {
  static identifierTemplate = '`%s`';
  static isPostgreSQL = false;

  static configure(databaseType: DatabaseType): void {
    this.isPostgreSQL = databaseType === DatabaseType.POSTGRESQL;
    this.identifierTemplate = this.isPostgreSQL ? '"%s"' : '`%s`';
  }

  static wrapIdentifier(value: string): string {
    return this.identifierTemplate.replace('%s', value);
  }

  static placeholder(index: number): string {
    return this.isPostgreSQL ? `$${index}` : '?';
  }

  static page(offset: number, limit: number): string {
    return this.isPostgreSQL
      ? `LIMIT ${limit} OFFSET ${offset}`
      : `LIMIT ${offset}, ${limit}`;
  }

  static returningId(): string {
    if (!this.isPostgreSQL) {
      return '';
    }

    return 'RETURNING id;';
  }
}
