import { Provider } from "../enum/app.enum";
import { FactoryProvider } from "@nestjs/common/interfaces/modules/provider.interface";
import { ConfigService } from "@nestjs/config";

async function gotLoader() {
  const { got } = await import(/*webpackIgnore: true*/ "got");
  return got;
}

export type RetGotType = Awaited<ReturnType<typeof gotLoader>>;

export const GotService: FactoryProvider<GotType> = {
  provide: Provider.GOT,
  useFactory: gotLoader,
  inject: [ConfigService],
};
