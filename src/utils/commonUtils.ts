export const uniqueCode = (): string => {
  // WinForms와 동일한 characters 문자열
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:;<=>?@!#$%&()*+-[]^_abcdefghijklmnopqrstuvwxyz{|}~';

  // .NET의 DateTime.UtcNow.Ticks에 해당하는 값 생성 (마이크로초 단위 시간)
  const now = Date.now();
  const perf =
    typeof performance !== 'undefined' && performance.now
      ? Math.floor(performance.now() * 1000)
      : 0;
  const ticks = (now * 10000 + perf).toString();

  let code = '';
  for (let i = 0; i < characters.length; i += 2) {
    if (i + 2 <= ticks.length) {
      const number = parseInt(ticks.substring(i, i + 2), 10);
      if (number > characters.length - 1) {
        const one = parseInt(number.toString().substring(0, 1), 10);
        const two = parseInt(number.toString().substring(1, 2), 10);
        code += characters[one];
        code += characters[two];
      } else {
        code += characters[number];
      }
    }
  }
  return code;
};

// 사용 예시: gpHj90h{4U
