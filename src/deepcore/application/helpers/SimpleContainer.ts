

export class Container {

  protected serialVersionUID: string = '';

  constructor(serialVersionUID: string) {
    this.serialVersionUID = serialVersionUID;
  }

}


class SimpleContainer extends Container {

  private static instance: SimpleContainer;

  private classesCollection: Map<string, Container> = new Map();

  constructor() {
    super('SimpleContainer');
  }

  static getInstance(): SimpleContainer {
    if (!SimpleContainer.instance) {
      SimpleContainer.instance = new SimpleContainer();
    }

    return SimpleContainer.instance;
  }

  private exists(name: string): boolean {
    return this.classesCollection.has(name);
  }

  register(clazz: any): void {
    const instance = new clazz();
    const name = instance.serialVersionUID;

    if (this.exists(name)) {
      return;
    }

    this.classesCollection.set(name, instance);
  }

  getInstance<T extends Container>(clazz: any): T | undefined {
    const instance = new clazz();
    const name = instance.serialVersionUID;
    return (this.exists(name)) ? <T><unknown>this.classesCollection.get(name) : undefined;
  }

}


export default SimpleContainer.getInstance();

