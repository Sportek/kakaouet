import { SetMetadata } from '@nestjs/common';
export enum Roles {
    Admin = 'admin',
    Organizer = 'organizer',
    Player = 'player',
    User = 'user',
}

// Le eslint a pas rapport d'indiquer un décorateur comme nécessitant un camelCase.
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Role = (role: Roles) => SetMetadata('role', role);
