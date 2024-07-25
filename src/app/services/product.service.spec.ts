import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IProductFinancial } from '../interfaces/product-financial.interface';

export const row1: IProductFinancial = {
  id: '0',
  name: `Nombre del producto 0`,
  description: 'Descripción',
  logo: 'logo',
  date_release: new Date('2024-07-24'),
  date_revision: new Date('2025-07-24'),
}

export const row2: IProductFinancial = {
  id: '1',
  name: `Nombre del producto 1`,
  description: 'Descripción',
  logo: 'logo',
  date_release: new Date('2024-07-24'),
  date_revision: new Date('2025-07-24'),
}

describe('ProductService', () => {
  let service: ProductService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
    service = TestBed.inject(ProductService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test getAll', () => {
    service.getAll().subscribe(products => {
        expect(products.length).toBe(2);
        expect(products).toEqual([row1, row2]);
    });
    const request = httpTestingController.expectOne('/api/bp/products');
    expect(request.request.method).toBe('GET');
    request.flush([row1, row2]);
  });

  it('should test getOne', () => {
    service.getOne('0').subscribe(product => {
        expect(product).toEqual(row1);
    });
    const request = httpTestingController.expectOne('/api/bp/products/0');
    expect(request.request.method).toBe('GET');
    request.flush(row1);
  });

  it('should test create', () => {
    service.create(row1).subscribe(resp => {
        expect(resp).toEqual({ data: row1 });
    });
    const request = httpTestingController.expectOne('/api/bp/products');
    expect(request.request.method).toBe('POST');
    request.flush({ data: row1 });
  });

  it('should test update', () => {
    service.update(row1).subscribe(resp => {
        expect(resp).toEqual({ data: row1 });
    });
    const request = httpTestingController.expectOne('/api/bp/products/0');
    expect(request.request.method).toBe('PUT');
    request.flush({ data: row1 });
  });

  it('should test delete', () => {
    service.delete('0').subscribe(resp => {
        expect(resp).toEqual();
    });
    const request = httpTestingController.expectOne('/api/bp/products/0');
    expect(request.request.method).toBe('DELETE');
  });

  it('should test verifyId', () => {
    service.verifyId('0').subscribe(resp => {
        expect(resp).toEqual(true);
    });
    const request = httpTestingController.expectOne('/api/bp/products/verification/0');
    expect(request.request.method).toBe('GET');

    const str = 'true';
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    request.flush(buf);
  });

  it('should test populate', () => {
    service.populate().subscribe(products => {
      expect(products.length).toBe(6);
    });
    const request = httpTestingController.match('/api/bp/products');
    request.forEach(el => el.flush([]))
    request.forEach(el => expect(el.request.method).toBe('POST'));
  });
});
