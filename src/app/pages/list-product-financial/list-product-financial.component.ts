import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProductFinancial } from '../../interfaces/product-financial.interface';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MESSAGE_ERROR } from '../../consts/message-error.const';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-list-product-financial',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    ModalComponent,
  ],
  templateUrl: './list-product-financial.component.html',
  styleUrl: './list-product-financial.component.scss'
})
export class ListProductFinancialComponent implements OnDestroy {
  private unsubscribeData: Subscription;
  private handleData$ = new Subject<void>();
  private searchInput$ = new Subject<string>();
  private unsubscribeSearchInput: Subscription;
  
  totalResults: number = 0;
  pagination: number[] = [];
  pageSize: number[] = [5, 10, 20];
  private lastPageSize: number = this.pageSize[0];
  lastPage: number = 1;
  
  searchTerm?: string;

  initData: IProductFinancial[] = [];
  data: IProductFinancial[] = [];

  loading = false;
  skeleton = Array.from({ length: this.lastPageSize }, () => {});

  constructor(
    private productService: ProductService
  ) {
    this.unsubscribeData = this.handleData$.subscribe(() => {
      const data = this.searchTerm ? 
        this.initData.filter(el => Object.keys(el).filter(key => key !== 'id').find(key => {
          const prop = el[key as keyof IProductFinancial];
            if (prop instanceof Date) {
              const date = prop.toLocaleDateString('en-GB');
              return date.includes(this.searchTerm ?? '');
            }
            
            return prop?.toLowerCase().includes(this.searchTerm?.toLowerCase() ?? '');
        })) :
        this.initData;
        
      this.totalResults = data.length;
      const indexLastPage = this.lastPage - 1;
      this.data = data.slice(indexLastPage * this.lastPageSize, this.lastPageSize + (indexLastPage * this.lastPageSize));

      const maxIndexPagination = Math.ceil(this.totalResults / Math.max(this.lastPageSize, 1) );
      this.pagination = Array.from({ length: maxIndexPagination }, (_, i) => i + 1);
      this.loading = false;
    });

    this.unsubscribeSearchInput = this.searchInput$.pipe(
      debounceTime(500)
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.lastPage = 1;
      this.handleData$.next();  
    });


    this.loading = true;
    this.productService.getAll().subscribe(initData => {
      this.initData = initData;
      this.handleData$.next();
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeData?.unsubscribe();
    this.unsubscribeSearchInput?.unsubscribe();
  }

  deleteProduct(id: string | null) {
    this.productService.delete(id ?? '').subscribe({
      next: () => {
        this.initData = this.initData.filter(el => el.id !== id);
        this.handleData$.next();
      },
      error: (e) => {
        if (e?.error?.message === MESSAGE_ERROR.NotFound) {
          alert('No se encontro el producto');
        } else {
          alert('Ha ocurrido un error al actualizar el producto');
        }
      }
    })
  }

  gotoPage(page: number) {
    if (this.lastPage === page) {
      return;
    }

    if (this.pagination.findIndex(el => el === page) > -1) {
      this.lastPage = page;
      this.handleData$.next();
    }
  }

  searchText(event: Event) {
    this.searchInput$.next((event.target as HTMLInputElement).value ?? '');
  }

  selectedPageSize(event: Event) {
    this.lastPageSize = Number((event.target as HTMLInputElement).value);
    this.lastPage = 1;
    this.handleData$.next();
  }
}
