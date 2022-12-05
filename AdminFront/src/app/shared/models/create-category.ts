export class Category {
  name: string | undefined;
  icon: string | undefined;
  // services: serviceArr[] = [];
  services: Object[] = [];

  constructor(name: string, icon: string, services: Object[]) {
    this.name = name;
    this.icon = icon;
    this.services = services;
  }

}



// export class serviceArr {
//   name: string | undefined;
// }
