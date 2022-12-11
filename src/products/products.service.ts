import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('Product Service');
  
  constructor(    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  
  
  async create(createProductDto: CreateProductDto) {
    try {
      // if(!createProductDto.slug){
      //   createProductDto.slug=createProductDto.title
      //      .toLowerCase()
      //      .replaceAll("'",'')
      //      .replaceAll(' ','_')
      // }
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );

      return product;
    } catch (error) {
      this.handleDBExeption(error);
    }
  }

  findAll(paginationDto:PaginationDto) {
    
    const { offset=3, limit=3 } =paginationDto;
    
    return this.productRepository.find({
      take:limit,
      skip:offset
      //TODO: Relations 
    });
  }

  async findOne(term: string) {
    term=term.toLowerCase()
    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term });
    } else{
      
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title)=:title or slug=:slug', {
          title:term,
          slug:term
        }).getOne();



    }

   
    if( !product )
        throw new NotFoundException(`Product with term ${term} not found`)
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    
    try {
      await this.productRepository.save( product );   
      
    } catch (error) {
      this.handleDBExeption(error);
    }
    
    return product;
  }

  async remove(id: string) {
    await this.findOne(id);
    
    this.productRepository.delete(id)
  }

  private handleDBExeption( error:any ){

     if ( error.code === '23505' )
         throw new BadRequestException(error.detail);

     this.logger.error(error);
     console.log(error);
     throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
