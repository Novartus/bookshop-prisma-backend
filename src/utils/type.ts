import { ResponseGlobalInterface } from './interface';

export type SuccessResponse = Record<string, unknown> | Array<unknown>;

export type GlobalResponseType = Promise<
  ResponseGlobalInterface<SuccessResponse>
>;

export const ResponseMap = <T>(
  data: T,
  message?: string | '',
  status?: boolean,
): { data: T; message: string; status: boolean } => {
  return {
    data,
    message: message || '',
    status: status || true,
  };
};
