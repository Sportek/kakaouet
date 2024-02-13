// question.dto.spec.ts
import { plainToClass } from 'class-transformer';
import 'reflect-metadata';
import { ChoiceDto } from './choice.dto';
import { QuestionDto } from './question.dto';

describe('QuestionDto', () => {
    it('should transform choices using ChoiceDto', () => {
        const plainObject = {
            type: 'example',
            label: 'Sample Question',
            choices: [{ label: 'Choice 1' }, { label: 'Choice 2' }],
        };
        const questionDto = plainToClass(QuestionDto, plainObject);

        expect(questionDto.choices).toBeInstanceOf(Array);
        questionDto.choices.forEach((choice) => {
            expect(choice).toBeInstanceOf(ChoiceDto);
        });
    });
});
