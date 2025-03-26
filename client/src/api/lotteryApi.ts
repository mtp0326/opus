import { postData } from '../util/api';

interface LotteryResult {
  mainWinner: {
    userId: string;
    name: string;
    xp: number;
    prize: number;
  };
  allPrizes: Array<{
    userId: string;
    amount: number;
  }>;
}

export const runLottery = async (
  lotteryPool: number,
): Promise<LotteryResult> => {
  const response = await postData('lottery/run', { lotteryPool });
  return response.data as LotteryResult;
};
