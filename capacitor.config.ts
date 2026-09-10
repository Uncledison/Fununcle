import type { CapacitorConfig } from '@capacitor/cli';

// 안드로이드 앱(내장형) 설정.
// webDir(dist)의 웹 자산을 APK 안에 번들 → 오프라인에서도 UI가 열림.
// server.url을 두지 않는다(원격 웹뷰가 아니라 로컬 번들 로드) → Play 심사에 유리.
const config: CapacitorConfig = {
  appId: 'com.uncledison.english',
  appName: '영단어 플래시카드',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      // 상태바 아이콘은 기본 앱 아이콘 사용(전용 모노크롬 아이콘은 추후 추가 가능).
      iconColor: '#FF6B00',
    },
  },
};

export default config;
