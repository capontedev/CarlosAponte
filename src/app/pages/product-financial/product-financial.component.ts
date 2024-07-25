import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { filter, map, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { DatePipe } from '@angular/common';
import { MESSAGE_ERROR } from '../../consts/message-error.const';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductFinancial } from '../../interfaces/product-financial.interface';

@Component({
  selector: 'app-product-financial',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './product-financial.component.html',
  styleUrl: './product-financial.component.scss'
})
export class ProductFinancialComponent implements OnInit {
  public form: FormGroup;
  private id?: string;
  private initData: IProductFinancial = {
    id: null,
    name: null,
    description: null,
    logo: null,
    date_release: new Date(),
    date_revision: this.getNextYear(new Date()),
  }

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group({
      id: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(10)], [this.validateId]],
      name: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      logo: [null, [Validators.required]],
      date_release: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), [Validators.required, this.validateDate]],
      date_revision: [{ value: this.datePipe.transform(this.getNextYear(new Date()), 'yyyy-MM-dd'), disabled: true }, [Validators.required]],
    });

    this.form.get('date_release')?.valueChanges.subscribe(value => {
      const date = this.dateToUTC(new Date(Date.parse(value)));
      const nextYear = this.getNextYear(date);

      this.form.patchValue({
        date_revision: this.datePipe.transform(nextYear, 'yyyy-MM-dd')
      }, {
        emitEvent: false
      });
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      filter(param => param['id']),
      switchMap((param) => this.productService.getOne(param['id']))
    ).subscribe({
      next: data => {
        this.initData = data;
        this.id = data.id ?? '';
        this.form.patchValue(this.processValue(this.initData));
        const idControl = this.form.controls['id'];
        idControl?.disable();
        idControl?.clearAsyncValidators();
        idControl?.updateValueAndValidity();
      },
      error: (e) => {
        if (e?.error?.message === MESSAGE_ERROR.NotFound) {
          alert('No se encontro el producto');
        } else {
          alert('Ha ocurrido un error al actualizar el producto');
        }

        this.router.navigate(['/list-product']);
      }
    });
  }

  getErrorControl(field: string) {
    const control = this.form.get(field);
    if (control?.touched && control?.invalid && control?.errors) {
      if (control.errors['invalid']) {
        return `${field} Invalido!`;
      }

      if (control.errors['required']) {
        return `Este campo es requerido`;
      }

      if (control.errors['minlength']) {
        return `Este campo requiere un mímino de ${control.errors['minlength']['requiredLength']} caracteres`;
      }

      if (control.errors['maxlength']) {
        return `Este campo requiere un máximo de ${control.errors['maxlength']['requiredLength']} caracteres`;
      }

      if (control.errors['dateInvalid']) {
        return `Fecha Invalida no puede ser menor a hoy`;
      }
    }

    return '';
  }

  private processValue(data: IProductFinancial) {
    return {
      ...data,
      date_release: this.datePipe.transform(data.date_release, 'yyyy-MM-dd'),
      date_revision: this.datePipe.transform(data.date_revision, 'yyyy-MM-dd'),
    }
  }

  reset() {
    this.form.patchValue(this.processValue(this.initData));
    this.form.markAsUntouched();
  }

  submit() {
    if (this.form.valid) {
      if (this.id) {
        this.productService.update(this.form.getRawValue()).subscribe({
          next: () => {
            alert('Producto actualizado');
            this.initData = this.form.getRawValue();
          },
          error: (e) => {
            if (e?.error?.message === MESSAGE_ERROR.NotFound) {
              alert('No se encontro el producto');
            } else {
              alert('Ha ocurrido un error al actualizar el producto');
            }
          }
        })  
        return;
      }

      this.productService.create(this.form.getRawValue()).subscribe({
        next: () => {
          alert('Producto creado')
          this.reset();
        },
        error: (e) => {
          if (e?.error?.message === MESSAGE_ERROR.DuplicateIdentifier) {
            alert('Producto repetido');
          } else {
            alert('Ha ocurrido un error al crear el producto');
          }
        }
      })
    }
  }

  //Validators
  public validateDate: ValidatorFn = (control: AbstractControl) => {
    const inputDate = control.value;

    if (inputDate) {
      const date = this.dateToUTC(new Date(Date.parse(inputDate)));
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (date < currentDate) {
        return { dateInvalid: true };
      }
    }
    return null;
  };

  public validateId: AsyncValidatorFn = (control: AbstractControl) => {
    return this.productService.verifyId(control.value)
      .pipe(
        map((result) =>
          result ? { invalid: true } : null
        )
      );
  };

  //Utils
  getNextYear(date: Date) {
    return new Date(date.setFullYear(date.getFullYear() + 1));
  }

  dateToUTC(date: Date) {
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    utcDate.setHours(0, 0, 0, 0);
    return utcDate;
  }
}
