import { Action } from './Action';

export class Policy {
  roleId: string = '';
  effect: string = 'deny';
  actions: Action[] = new Array<Action>();
}
