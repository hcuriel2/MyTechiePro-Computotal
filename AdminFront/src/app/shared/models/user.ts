import { Address } from './address';
import { Company } from './company';

export class User {
  _id: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  phoneNumber: string | undefined;
  email: string | undefined;
  password: string | undefined;
  userType: string | undefined;
  address: Address | undefined;
  company: Company | undefined;
  skills: any[] | undefined;
  projects: any[] | undefined; 

  // Professional's attributes
  alias: string | undefined;
  bio: string | undefined;
  proStatus: string | undefined;
  unitPrice: number | undefined;
  unitType: string | undefined;
  performance: any[];
  rating: number;
  ratingSum: number;
  ratingCount: number;
  approved: boolean;
}
