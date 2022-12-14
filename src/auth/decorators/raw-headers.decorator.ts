import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';


export const RawHeaders = createParamDecorator( 
    ( data, ctx:ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        console.log(req.rawHeaders);
        const rawHeaders= req.rawHeaders;

        if(!rawHeaders)
            throw new InternalServerErrorException('rawHeaders not found');

        return rawHeaders;
});