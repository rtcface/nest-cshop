import { BadRequestException, 
  Injectable, 
  InternalServerErrorException, 
  Logger, 
  NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateProductDto,CreateProductDto } from './dto';
import { ProductImage,Product } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('Product Service');
  
  constructor(    
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,    
    private readonly dataSource:DataSource,

  ) {}

  
  
  async create(createProductDto: CreateProductDto) {
    try {
      // if(!createProductDto.slug){
      //   createProductDto.slug=createProductDto.title
      //      .toLowerCase()
      //      .replaceAll("'",'')
      //      .replaceAll(' ','_')
      // }

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url:image }) )
      });
      await this.productRepository.save( product );

      return {...product, images};
    } catch (error) {
      this.handleDBExeption(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    
    const { offset=3, limit=3 } =paginationDto;
    
    const products = await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true
      }
      //TODO: Relations 
    });

    return products.map(
      ({ images, ...rest }) => ({
        ...rest,
        images: images.map( img => img.url )
      })
    );

  }

  async findOne(term: string) {
    term=term.toLowerCase()
    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term });
    } else{
      
      const queryBuilder = this.productRepository.createQueryBuilder('pd');
      product = await queryBuilder
        .where('LOWER(title)=:title or slug=:slug', {
          title:term,
          slug:term
        })
        .leftJoinAndSelect('pd.images','pi')
        .getOne();



    }

   
    if( !product )
        throw new NotFoundException(`Product with term ${term} not found`)
    
    return product;
  }

  async findOnePlain( term:string ){
    const { images=[], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;
    
    const product = await this.productRepository.preload({id,...toUpdate});

    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    const queryRunner = this.dataSource.createQueryRunner(); 
    await queryRunner.connect();
    await queryRunner.startTransaction();


    
    try {

      if( images ){
        await queryRunner.manager.delete(ProductImage,{ product: {id}});

        product.images = images.map(
          image => this.productImageRepository.create({url:image})
        );
      } else{

      }

      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();


      //await this.productRepository.save( product );   
      return this.findOnePlain(id);  
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExeption(error);
    }
    
    
  }

  async remove(id: string) {
    await this.findOne(id);
    
    this.productRepository.delete(id)
  }

  async ResetProducts(){
    const query = this.productRepository.createQueryBuilder('pd');
    try {
      return await query
      .delete()
      .where({})
      .execute();
      
    } catch (error) {
      this.handleDBExeption(error);
    }
  }

  private handleDBExeption( error:any ){

     if ( error.code === '23505' )
         throw new BadRequestException(error.detail);

     this.logger.error(error);
     console.log(error);
     throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
