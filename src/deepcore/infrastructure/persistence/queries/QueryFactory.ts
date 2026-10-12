import { Delete } from './Delete';
import { Insert } from './Insert';
import { Select } from './Select';
import { Update } from './Update';
import { DatabaseType } from '../DatabaseFactory';
import { SqlDialect } from './SqlDialect';

export class QueryFactory {
  static configure(databaseType: DatabaseType): void {
    SqlDialect.configure(databaseType);
  }

  static createSelect(fields?: string[]): Select {
    return Select.getInstance(fields);
  }

  static createInsert(): Insert {
    return new Insert();
  }

  static createUpdate(tablename: string): Update {
    return new Update(tablename);
  }

  static createDelete(tablename: string): Delete {
    const query = new Delete();
    query.disableAlias();
    return query.from(tablename);
  }
}
