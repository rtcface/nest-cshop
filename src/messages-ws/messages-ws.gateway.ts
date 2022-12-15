import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesWsService: MessagesWsService) {}
  
  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connect',client.id);
  }
  
  handleDisconnect(client: Socket) {
    console.log('Client disconnect', client.id);
  }
}
