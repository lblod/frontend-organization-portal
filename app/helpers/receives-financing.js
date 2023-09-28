const FINANCING_CODE = {
  '997073905f839ac6bafe92b76050ab0b': 'Nee', //SELF_FINANCED
  '9d6f49b3d923b437ec3a91e8b5fa6885': 'Ja', //FOD_FINANCED:
};

export default function receivesFinancing(financingCodeId) {
  return FINANCING_CODE[financingCodeId];
}
