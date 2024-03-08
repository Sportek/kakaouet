import { mockQuizTable } from '@app/services/quiz/mock-quiz';
import { AnswerState, Game, GameRole, GameType, Quiz } from '@common/types';

export const mockGame: Partial<Game> = {
    users: [
        {
            _id: '1',
            answerState: AnswerState.Waiting,
            isActive: true,
            isExcluded: false,
            name: 'Player 1',
            score: 0,
            role: GameRole.Player,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
    quiz: mockQuizTable[0] as Quiz,
    type: GameType.Random,
    isLocked: false,
    code: '1234',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
};
