import { UserModule } from '@app/modules/user/user.module';
import { ApiProperty } from '@nestjs/swagger';

describe('UserModule', () => {
    it('should be defined', () => {
        expect(UserModule).toBeDefined();
    });
});

export class Message {
    @ApiProperty({ example: 'Mon Message' })
    title: string;
    @ApiProperty({ example: 'Je suis envoyé à partir de la documentation!' })
    body: string;
}
