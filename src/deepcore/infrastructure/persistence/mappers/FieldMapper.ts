import { SqlDialect } from '../queries/SqlDialect';

export class FieldMapper {
  static readonly StringReplace = '%s';
  static readonly Fields = '(%s)';

  static fieldReplace(value: string): string {
    return SqlDialect.wrapIdentifier(value);
  }
}