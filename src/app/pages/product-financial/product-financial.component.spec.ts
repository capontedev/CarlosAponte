import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFinancialComponent } from './product-financial.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { of } from 'rxjs';
import { IProductFinancial } from '../../interfaces/product-financial.interface';

export const rowFake1: IProductFinancial = {
  id: '000',
  name: `Nombre del producto 0`,
  description: 'Descripción',
  logo: 'logo',
  date_release: new Date(),
  date_revision: new Date(),
}

describe('ProductFinancialComponent', () => {
  let component: ProductFinancialComponent;
  let fixture: ComponentFixture<ProductFinancialComponent>;

  const fakeService = { 
    update: (data: IProductFinancial) => of(data),
    create: (data: IProductFinancial) => of(data),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    verifyId: (_: string) => of(false),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOne: (_: string) => of(rowFake1),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductFinancialComponent,
        HttpClientTestingModule,
        RouterModule,
      ],
      providers: [
        { 
          provide: ProductService,
          useValue: fakeService
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of()
          }
        }
      ],
    })
    .compileComponents();

  });

  const init = () => {
    fixture = TestBed.createComponent(ProductFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

  it('should create product', () => {
    init();
    spyOn(window, 'alert');
    component.form.setValue({...rowFake1});
    expect(component.form.valid).toBeTrue();
    fixture.detectChanges();
    component.submit();
    expect(window.alert).toHaveBeenCalledWith('Producto creado');
  });

  it('should update product', () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: {
      params: of({id: '000'})
    } });
    init();
    spyOn(window, 'alert');

    component.form.patchValue({
      name: 'Producto de prueba'
    });
    
    expect(component.form.valid).toBeTrue();
    fixture.detectChanges();
    component.submit();
    expect(window.alert).toHaveBeenCalledWith('Producto actualizado');
  });

  it('should validation', () => {
    init();
    component.form.patchValue({
      id: null,
    });
    component.form.markAllAsTouched();
    component.getErrorControl('id');

    let control = component.form.get('id');

    expect(control && control.errors && control.errors['required']).toBeTrue();
    expect(component.form.valid).toBeFalse();

    component.form.patchValue({
      id: '00',
    });
    component.form.markAllAsTouched();
    component.getErrorControl('id');
    expect(control && control.errors && control.errors['minlength']).toEqual({ requiredLength: 3, actualLength: 2 });
    expect(component.form.valid).toBeFalse();

    component.form.patchValue({
      id: '00000000000',
    });
    component.form.markAllAsTouched();
    component.getErrorControl('id');
    expect(control && control.errors && control.errors['maxlength']).toEqual({ requiredLength: 10, actualLength: 11 });
    expect(component.form.valid).toBeFalse();

    const d = new Date();
    d.setDate(d.getDate() - 1);
    component.form.patchValue({
      date_release: d,
    });
    component.form.markAllAsTouched();
    component.getErrorControl('date_release');
    control = component.form.get('date_release');
    expect(control && control.errors && control.errors['dateInvalid']).toBeTrue();
    expect(component.form.valid).toBeFalse();
  });
});
