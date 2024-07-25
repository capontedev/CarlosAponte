export interface IProductFinancial {
  id: string | null;
  name: string | null;
  description: string | null;
  logo: string | null;
  date_release: Date;
  date_revision: Date;
}


export interface IProductFinancialResponse {
  name?: string;
  message?: string;
  data?: IProductFinancial
}