// history.dto.spec.ts
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';
import { HistoryDto } from './history.dto';

describe('HistoryDto', () => {
    it('should validate with no errors for valid data', async () => {
        const plainObject = {
            gameTitle: 'Super Mario Bros',
            startTime: new Date(),
            numberOfPlayers: 4,
            bestScore: 10000,
        };
        const historyDto = plainToClass(HistoryDto, plainObject);

        const errors = await validate(historyDto);
        expect(errors.length).toBe(0);
    });

    it('should validate and fail with errors for invalid data', async () => {
        const plainObject = {
            gameTitle: '',
            startTime: 'invalid-date',
            numberOfPlayers: -2,
            bestScore: -100,
        };
        const historyDto = plainToClass(HistoryDto, plainObject);

        const errors = await validate(historyDto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
