import { GlobalStatus } from '../commons/constants/GlobalConstants';

export class Action {
  name: string = '';
  method: string = '';
  status: string = GlobalStatus.Active;
}
