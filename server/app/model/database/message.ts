import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { GameUser } from './game-user';

@Schema()
export class Message {
    @ApiProperty()
    @Prop({ required: true, type: () => GameUser })
    gameUser: GameUser;

    @ApiProperty()
    @Prop({ required: true })
    content: string;

    @ApiProperty()
    createdAt?: Date;
}

export const messageSchema = SchemaFactory.createForClass(Message);
messageSchema.set('timestamps', true);
