import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { EnvConfiguration } from '../config/app.config';



@Module({
  imports: [
    ConfigModule.forRoot(
      {
        load:[EnvConfiguration]
      }
    ),
    TypeOrmModule.forRoot({
      type:'postgres',
      host:process.env.DB_HOST,
      port:+process.env.DB_PORT,
      username:process.env.DB_USERNAME,
      password:process.env.DB_PASS,
      database:process.env.DB_NAME,
      autoLoadEntities:true,
      synchronize:true
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule    
  ]
})
export class AppModule {}
