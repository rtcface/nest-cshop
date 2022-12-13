import { BadRequestException,
         Controller,
         Get,
         Param,
         Post,
         Res,
         UploadedFile,
         UseInterceptors} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter,fileNamer } from './helpers'


@Controller('files')
export class FilesController {
  private host:string;

  constructor(
    private readonly filesService: FilesService,
    private readonly configService:ConfigService
    ) {
      this.host= this.configService.get<string>('host_api');
    }

  

  
  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName'
    ) imageName:string ){

    const path = this.filesService.getStaticProductImage(imageName);

      res.sendFile( path );
  }


  @Post('product')
  @UseInterceptors( FileInterceptor('file',
  {
    fileFilter,
    limits:{ fileSize:500000 },
    storage: diskStorage({
      destination:'./static/products',
      filename:fileNamer
    })
  }
  ))
  upLoadFile(@UploadedFile() file: Express.Multer.File){
    
    if( !file ){
      throw new BadRequestException('Make sure that the file is an image');
    }
    const secureUrl = `${this.host}/files/product/${file.filename}`;
    return {
      secureUrl
    };
  }
  
}
