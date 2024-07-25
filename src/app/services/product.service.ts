import { Injectable } from '@angular/core';
import { IProductFinancial, IProductFinancialResponse } from '../interfaces/product-financial.interface';
import { concatMap, delay, forkJoin, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<IProductFinancial[]> {
    return this.http.get<{ data: IProductFinancial[] }>(`/api/bp/products`)
      .pipe(
        concatMap(item => of(item).pipe(delay(2000))),
        map(items => items.data)
      );
  }

  getOne(id: string): Observable<IProductFinancial> {
    return this.http.get<IProductFinancial>(`/api/bp/products/${id}`);
  }

  create(data: IProductFinancial): Observable<IProductFinancialResponse> {
    return this.http.post(`/api/bp/products`, data);
  }

  update(data: IProductFinancial): Observable<IProductFinancialResponse> {
    const {id, ...rest} = data;
    return this.http.put(`/api/bp/products/${id}`, rest);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/bp/products/${id}`);
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get(`/api/bp/products/verification/${id}`, { responseType: 'arraybuffer' })
      .pipe(map(value => {
        const decoder = new TextDecoder();
        const str = decoder.decode(value);
        return str === 'true';
      }));
  }

  populate() {
    return forkJoin(Array.from({ length: 6 }, (_, i) =>
      this.http.post(`/api/bp/products`, {
        id: i.toString().padStart(3, '0'),
        name: `Nombre del producto ${i + 1}`,
        description: 'Descripción',
        logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
        date_release: new Date(),
        date_revision: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      })
    ));
  }
}
