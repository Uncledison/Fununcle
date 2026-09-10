// 네이티브(안드로이드 앱) 로컬 알림 — "복습할 시간!" 리마인더.
//
// 설계 원칙:
//   - 네이티브 앱에서만 동작. 웹 브라우저에서는 전부 no-op(아무 일도 안 함) →
//     기존 웹앱(fun.uncledison.com)에는 영향 0. isNativePlatform() 가드로 보장.
//   - 서버/푸시 불필요. 기기 안에서 예약되는 로컬 알림이라 오프라인·무료.
//   - SRS가 계산한 "다음 복습 예정 시각"에 맞춰 예약. 세션이 끝나거나 앱을 열 때마다
//     기존 예약을 취소하고 최신 일정으로 다시 건다(rescheduleReviewReminder).

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { nextReviewReminder } from './srs';

const REMINDER_ID = 1001; // 복습 리마인더 고정 ID(항상 이 하나만 갱신)

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// 알림 권한 확보(Android 13+는 런타임 허용 필요). 이미 허용돼 있으면 그대로.
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

// 다음 복습 리마인더를 최신 일정으로 다시 예약.
// 웹에서는 즉시 반환(no-op). 예정된 복습이 없으면 예약도 하지 않음.
export async function rescheduleReviewReminder(allowed: string[]): Promise<void> {
  if (!isNativeApp()) return;
  try {
    // 기존 예약 취소(중복/구식 알림 방지)
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });

    const next = nextReviewReminder(allowed);
    if (!next) return;

    const granted = await ensureNotificationPermission();
    if (!granted) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: '오늘의 영어 복습 📚',
          body: `복습할 단어 ${next.count}개가 기다리고 있어요!`,
          schedule: { at: new Date(next.at), allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* 알림 실패는 학습에 영향 주지 않도록 조용히 무시 */
  }
}

// [임시/테스트 전용] 약 8초 뒤 알림 1건을 띄운다. 폰에서 알림 파이프라인 확인용.
// 내장형 앱은 주소창이 없어 URL로 테스트할 수 없으므로 앱 내 버튼에서 호출.
// Play 배포 전 이 함수와 호출 버튼을 제거한다.
export async function scheduleTestNotification(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '알림 테스트 ✅',
          body: '복습 알림이 정상 동작합니다! (약 8초 뒤 표시)',
          schedule: { at: new Date(Date.now() + 8000) },
        },
      ],
    });
  } catch {
    /* noop */
  }
}
