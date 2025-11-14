// import { NestFactory, Reflector } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { GroupsGuard } from './auth/Groups.guard';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   const reflector = app.get(Reflector);

//   // ✅ Now public routes bypass JWT
//   app.useGlobalGuards(
//     new JwtAuthGuard(reflector),
//     new GroupsGuard(reflector),
//   );

//   await app.listen(3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();