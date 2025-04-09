export const uniqueCode = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 10; // GUID 길이
  let guid = '';

  // 첫 번째 문자는 항상 알파벳
  guid += characters[Math.floor(Math.random() * 52)]; // 0-51 사이의 인덱스 (알파벳만)

  // 나머지 9개 문자 생성
  for (let i = 1; i < length; i++) {
    if (i === 5) {
      guid += '{'; // 5번째 위치에 '{' 추가
    } else {
      guid += characters[Math.floor(Math.random() * characters.length)];
    }
  }

  return guid;
};

// 사용 예시: gpHj90h{4U
