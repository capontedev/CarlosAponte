import { Routes } from '@angular/router';
import { ListProductFinancialComponent } from './pages/list-product-financial/list-product-financial.component';
import { ProductFinancialComponent } from './pages/product-financial/product-financial.component';

export const routes: Routes = [
    { path: 'list-product', component: ListProductFinancialComponent },
    { path: 'product', component: ProductFinancialComponent },
    { path: 'product/:id', component: ProductFinancialComponent },
    { path: '', redirectTo: '/list-product', pathMatch: 'full' },
];
