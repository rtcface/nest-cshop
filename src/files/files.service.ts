import { join } from 'path';
import { existsSync } from 'fs';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilesService {

    getStaticProductImage( imageName:string ){

        const path = join( __dirname, '../../../static/products',imageName);
        console.log(path);
        if( !existsSync(path) )
            throw new BadRequestException(`No product found with image ${imageName}`);


        return path;

    }
 

}
