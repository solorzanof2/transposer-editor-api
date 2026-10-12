import { RegularExpression } from '../constants/RegexConstants'


export const useCutSourcePath = (value: string): string => {
  let [text] = value.match(RegularExpression.SourcePath) ?? '';
  return text;
}

