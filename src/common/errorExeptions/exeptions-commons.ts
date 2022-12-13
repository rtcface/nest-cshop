import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export function handleDBExeption( error:any ):never{

    if ( error.code === '23505' )
        throw new BadRequestException(error.detail);

    this.logger.error(error);
    console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
 }