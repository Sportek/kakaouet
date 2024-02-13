import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    label: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;
}
