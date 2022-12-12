import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from '../seed/seed-data'

@Injectable()
export class SeedService {

  constructor(private readonly productService:ProductsService) {
    
  }
 

 async runSeed(){
  this.insertNewProducts();
    console.log('Execute seed');
    return 'Execute seed';
  }

  private async insertNewProducts(){
    await this.productService.ResetProducts();
    const products = initialData.products;

    const insertPromise = [];

    products.forEach( product => {
      insertPromise.push( this.productService.create( product ))
    });

    await Promise.all( insertPromise);

    return true;
  }

}
