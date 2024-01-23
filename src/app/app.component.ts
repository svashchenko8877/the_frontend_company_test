import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {
  MatCell,
  MatCellDef,
  MatColumnDef, MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap} from "rxjs";
import {Product} from "./models/product";
import {MatFormField, MatInput} from "@angular/material/input";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatPaginator,
    ReactiveFormsModule,
    MatFormField,
    MatTable,
    MatTable,
    MatHeaderRowDef,
    MatCellDef,
    MatColumnDef,
    MatInput,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRowDef,
    MatRow,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  mockData: Product[] = [];
  displayedColumns: Array<keyof Product> = ['id', 'name', 'category', 'price', 'description', 'stockQuantity'];
  dataSource = new MatTableDataSource<Product>([]);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  filterForm: FormGroup;

  ngOnInit(): void {
    this.mockData = Array.from({ length: 1000 }, (_, index) => this.generateRandomProduct(index + 1));
    this.dataSource.paginator = this.paginator;

    this.filterForm = new FormGroup({
      category: new FormControl(''),
      priceRangeMin: new FormControl(''),
      priceRangeMax: new FormControl(''),
    });

    this.setupFilterObservables();
  }
  private setupFilterObservables(): void {
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => this.applyFilters())
      )
      .subscribe((filteredData) => {
        this.dataSource.data = filteredData;
        this.paginator.firstPage();
      });
  }

  private applyFilters(): Observable<Product[]> {
    const categoryFilter = this.filterForm.get('category').value.toLowerCase();
    const minPriceFilter = this.filterForm.get('priceRangeMin').value;
    const maxPriceFilter = this.filterForm.get('priceRangeMax').value;

    return of(this.mockData.filter(product => {
      const categoryMatch = categoryFilter ? product.category.toLowerCase().includes(categoryFilter) : true;
      const minPriceMatch = minPriceFilter ? product.price >= minPriceFilter : true;
      const maxPriceMatch = maxPriceFilter ? product.price <= maxPriceFilter : true;

      return categoryMatch && minPriceMatch && maxPriceMatch;
    }));
  }

  private generateRandomProduct(id: number): Product  {
    const categories: string[] = ['Electronics', 'Clothing', 'Home Appliances', 'Toys', 'Books'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    return {
      id,
      name: `Product ${id}`,
      category: randomCategory,
      price: Math.random() * 1000 + 10,
      description: `Description for Product ${id}`,
      stockQuantity: Math.floor(Math.random() * 100) + 1,
    };
  };
}
