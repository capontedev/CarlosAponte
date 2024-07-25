import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ListProductFinancialComponent } from './list-product-financial.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IProductFinancial } from '../../interfaces/product-financial.interface';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

export const rowFake1: IProductFinancial = {
  id: '0',
  name: `Nombre del producto 0`,
  description: 'Descripción',
  logo: 'logo',
  date_release: new Date('2024-07-24'),
  date_revision: new Date('2025-07-24'),
}

export const rowFake2: IProductFinancial = {
  id: '1',
  name: `Nombre del producto 1`,
  description: 'Descripción',
  logo: 'logo',
  date_release: new Date('2024-07-24'),
  date_revision: new Date('2025-07-24'),
}

describe('ListProductFinancialComponent', () => {
  let component: ListProductFinancialComponent;
  let fixture: ComponentFixture<ListProductFinancialComponent>;

  const fakeService = { 
    getAll: () => of([rowFake1, rowFake2]),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delete: (id: string) => of(id),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListProductFinancialComponent,
        RouterModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
      .compileComponents();

  });

  const init = () => {
    fixture = TestBed.createComponent(ListProductFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

  it('should view data in table', () => {
    TestBed.overrideProvider(ProductService, { useValue: fakeService });
    init();

    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    expect(tableRows.length).toBe(3);

    // Header row
    const headerRow = tableRows[0];
    expect(headerRow.cells[0].innerHTML).toBe('Logo');
    expect(headerRow.cells[1].innerHTML).toBe('Nombre del producto');
    expect(headerRow.cells[2].innerHTML).toContain('Descripción');
    expect(headerRow.cells[3].innerHTML).toContain('Fecha de liberación');
    expect(headerRow.cells[4].innerHTML).toContain('Fecha de reestructuración');
    expect(headerRow.cells[5].innerHTML).toBe('');    


    // Data rows
    const row1 = tableRows[1];
    expect(row1.cells[0].innerHTML).toContain('src="logo"');
    expect(row1.cells[1].innerHTML).toBe('Nombre del producto 0');
    expect(row1.cells[2].innerHTML).toBe('Descripción');
    expect(row1.cells[3].innerHTML).toBe('23/07/2024');
    expect(row1.cells[4].innerHTML).toBe('23/07/2025');
    expect(row1.cells[5].innerHTML).toContain('src="./assets/menu-actions.png');
    expect(row1.cells[5].innerHTML).toContain('ng-reflect-router-link="/product/0">Actualizar</div>');
    expect(row1.cells[5].innerHTML).toContain('Eliminar');
    expect(row1.cells[5].innerHTML).toContain('¿Estas seguro de eliminar el producto Nombre del producto 0?');

    // Data rows
    const row2 = tableRows[2];
    expect(row2.cells[0].innerHTML).toContain('src="logo"');
    expect(row2.cells[1].innerHTML).toBe('Nombre del producto 1');
    expect(row2.cells[2].innerHTML).toBe('Descripción');
    expect(row2.cells[3].innerHTML).toBe('23/07/2024');
    expect(row2.cells[4].innerHTML).toBe('23/07/2025');
    expect(row2.cells[5].innerHTML).toContain('src="./assets/menu-actions.png');
    expect(row2.cells[5].innerHTML).toContain('ng-reflect-router-link="/product/1">Actualizar</div>');
    expect(row2.cells[5].innerHTML).toContain('Eliminar');
    expect(row2.cells[5].innerHTML).toContain('¿Estas seguro de eliminar el producto Nombre del producto 1?');
  });

  it('should view return results', () => {
    TestBed.overrideProvider(ProductService, { useValue: fakeService });
    init();

    const result = fixture.nativeElement.querySelector('.footer span');
    expect(result.innerHTML).toContain('2 Resultados');
  });

  it('should view selection pages', () => {
    TestBed.overrideProvider(ProductService, { useValue: fakeService });
    init();

    const select = fixture.nativeElement.querySelector('.footer select');
    expect(select.length).toBe(3);

    expect(select[0].innerHTML).toBe('5');
    expect(select[1].innerHTML).toBe('10');
    expect(select[2].innerHTML).toBe('20');
  });

  it('should no view pagination', () => {
    init();
    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeNull();
  });

  it('should view pagination', () => {
    const fakeService1 = { 
      getAll: () => of(Array.from({ length: 10 }, () => rowFake1)),
    };
    TestBed.overrideProvider(ProductService, { useValue: fakeService1 });
    init();

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeTruthy();

    const pages = fixture.nativeElement.querySelectorAll('.pagination .page.hide-pages');
    expect(pages.length).toBe(2);
  });

  it('should set pagination', () => {
    const fakeService1 = { 
      getAll: () => of(Array.from({ length: 10 }, () => rowFake1)),
    };
    TestBed.overrideProvider(ProductService, { useValue: fakeService1 });
    init();

    const pagination = fixture.nativeElement.querySelector('.pagination');
    expect(pagination).toBeTruthy();
    
    const pages = fixture.nativeElement.querySelectorAll('.pagination .page.hide-pages');
    
    pages[1].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    const pages2 = fixture.nativeElement.querySelector('span.page.hide-pages.page-selected');
    expect(pages2.innerHTML).toBe(' 2 ');

    //Again
    pages[1].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(pages2.innerHTML).toBe(' 2 ');
  });

  it('should delete row', () => {
    TestBed.overrideProvider(ProductService, { useValue: fakeService });
    init();

    component.deleteProduct('0');
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    expect(tableRows.length).toBe(2);
  });

  it('should filter row', fakeAsync(() => {
    TestBed.overrideProvider(ProductService, { useValue: fakeService });
    init();
    const input = fixture.debugElement.query(By.css('input'));
    const el = input.nativeElement;
    el.value = 'Nombre del producto 0';
    el.dispatchEvent(new Event('input'));
    tick(1000);
    fixture.detectChanges();

    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    expect(tableRows.length).toBe(2);
  }));
});
