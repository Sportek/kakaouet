import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop()
    token?: string;

    @ApiProperty()
    @Prop({ default: false })
    isAdminAuthentified?: boolean;

    @ApiProperty()
    @Prop({ default: [] })
    games: { gameId: string; gameUserId: string }[];

    @ApiProperty()
    @Prop()
    lastRequestAt?: Date;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const userSchema = SchemaFactory.createForClass(User).index({ lastRequestAt: 1 }, { expireAfterSeconds: 86400 });

userSchema.set('timestamps', true);
