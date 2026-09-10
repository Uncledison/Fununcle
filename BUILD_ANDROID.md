# 안드로이드 앱 빌드 가이드 (영단어 플래시카드)

이 저장소는 **Capacitor 내장형(bundled)** 방식으로 안드로이드 앱을 만듭니다.
웹 화면을 APK 안에 담고, **네이티브 로컬 알림**으로 복습 리마인더를 띄웁니다.

- 앱 ID: `com.uncledison.english`
- 시작 화면: 영단어 플래시카드(`/english`) — 앱에서는 자동으로 여기서 시작
- 알림: SRS가 계산한 "다음 복습 예정일" 저녁 7시에 "복습할 단어 N개가 기다리고 있어요"

---

## 처음 한 번 (준비물)

- **Android Studio** 설치 (Android SDK 포함)
- **Node.js 20+**

## APK 빌드 (매번 이 순서)

저장소 폴더에서:

```bash
npm install          # 처음 한 번만
npm run android:sync # 웹 빌드(dist) + 안드로이드로 동기화
npm run android:open # Android Studio에서 android/ 프로젝트 열기
```

Android Studio가 열리면:

1. 우측 하단 Gradle 동기화가 끝날 때까지 대기
2. 상단 메뉴 **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. 완료 팝업의 **locate** 클릭 → `android/app/build/outputs/apk/debug/app-debug.apk`
4. 이 APK를 폰에 옮겨 설치 (또는 폰 USB 연결 후 Android Studio ▶ Run)

> 실기기 테스트가 가장 빠릅니다: 폰을 USB로 연결하고 개발자모드 → USB 디버깅 켠 뒤 Android Studio에서 ▶ Run.

## 알림 동작 확인

1. 앱 첫 실행 시 **알림 권한 허용** (Android 13+)
2. 맵 화면의 임시 버튼 **🔔 알림 테스트 (8초 뒤 알림)** 탭 → 약 8초 뒤 상태바에 알림이 뜨면 성공
   - 이 버튼은 테스트용이라 Play 배포 전 제거합니다.
3. 실제 복습 알림: 단어를 학습하면 다음 복습 예정일(저녁 7시)에 자동으로 알림이 예약됩니다.

## 웹을 수정했을 때 (앱 갱신)

내장형이라 웹을 고치면 **APK를 다시 빌드**해야 앱에 반영됩니다:

```bash
npm run android:sync   # 다시 동기화
# Android Studio에서 다시 Build APK(s)
```

버전을 올릴 땐 `android/app/build.gradle`의 `versionCode`(정수 +1)와 `versionName`을 수정하세요.

---

## 아직 남은 다듬기 (선택)

- **앱 아이콘**: 지금은 Capacitor 기본 아이콘. `public/icon-english-512.png`를 소스로
  런처 아이콘을 생성하면 됩니다 (`@capacitor/assets` 사용 또는 Android Studio의
  Image Asset Studio). 별도로 안내 가능.
- **상태바 알림 아이콘**: 현재 기본값. 흰색 모노크롬 아이콘을 추가하면 더 깔끔합니다.
- **Play 스토어 출시**: 서명 키(keystore) 생성 → release AAB 빌드 → Play Console 등록.
  (서명 키는 분실 시 업데이트 불가하므로 반드시 안전하게 보관)
- **임시 코드 제거**: 배포 전 `🔔 알림 테스트` 버튼과 `scheduleTestNotification()` 제거.

## 롤백

앱/알림 관련 변경은 모두 이 브랜치의 커밋 단위라 `git revert`로 되돌릴 수 있고,
웹앱(fun.uncledison.com)에는 영향이 없습니다(알림 코드는 네이티브에서만 동작).
